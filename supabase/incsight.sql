-- ============================================================
-- IncSight schema (PostgreSQL 14+)
--
-- Backs Tickets & Services > IncSight. Tickets arrive from Ivanti ITSM
-- (and Jira) through integrations/ivanti/sync_tickets.py, which only READS
-- from Ivanti and upserts here. The portal reads the views at the bottom.
-- Safe to re-run.
-- ============================================================

-- SLA targets per ticket type and priority. Placeholders: set them to Najm's policy.
create table if not exists sla_policies (
  ticket_type     text not null,               -- Incident, Service Request
  priority        int  not null check (priority between 1 and 5),
  response_min    int  not null,
  resolution_min  int  not null,
  pause_statuses  text[] not null default array['On Hold','Pending Customer'],
  primary key (ticket_type, priority)
);
insert into sla_policies (ticket_type, priority, response_min, resolution_min) values
  ('Incident', 1, 15, 240), ('Incident', 2, 30, 480), ('Incident', 3, 120, 1440), ('Incident', 4, 480, 4320),
  ('Service Request', 1, 30, 480), ('Service Request', 2, 60, 1440), ('Service Request', 3, 240, 2880), ('Service Request', 4, 480, 7200)
on conflict do nothing;

create table if not exists tickets (
  id              bigint generated always as identity primary key,
  source          text not null check (source in ('Ivanti','Jira')),
  source_rec_id   text not null,               -- Ivanti RecId / Jira issue id
  number          text not null,               -- IncidentNumber, ServiceReqNumber, Jira key
  ticket_type     text not null,               -- Incident, Service Request, Change, Problem
  subject         text,
  service         text,
  category        text,
  owner_team      text,                        -- assignment group
  owner           text,                        -- assignee
  priority        int,
  status          text not null,
  created_at      timestamptz not null,
  responded_at    timestamptz,
  resolved_at     timestamptz,
  closed_at       timestamptz,
  reopen_count    int not null default 0,
  source_modified_at timestamptz,              -- Ivanti LastModDateTime: drives incremental sync
  synced_at       timestamptz not null default now(),
  raw             jsonb,                       -- the record as Ivanti returned it, for fields not mapped yet
  unique (source, source_rec_id)
);
create index if not exists tickets_open_idx on tickets (status) where resolved_at is null;
create index if not exists tickets_created_idx on tickets (created_at);
create index if not exists tickets_service_idx on tickets (service);

-- Every status / owner change seen by the sync; SLA pause time is computed from it.
create table if not exists ticket_events (
  ticket_id   bigint not null references tickets(id) on delete cascade,
  at          timestamptz not null,
  field       text not null,                   -- status, owner_team, owner, priority
  old_value   text,
  new_value   text,
  primary key (ticket_id, at, field)
);

create table if not exists ticket_sync_runs (
  id            bigint generated always as identity primary key,
  source        text not null,
  object        text not null,                 -- incidents, servicereqs, …
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  status        text not null check (status in ('Running','OK','Failed')),
  watermark     timestamptz,                   -- highest source_modified_at stored by this run
  fetched       int not null default 0,
  inserted      int not null default 0,
  updated       int not null default 0,
  message       text
);
create index if not exists ticket_sync_runs_latest_idx on ticket_sync_runs (source, object, started_at desc);

-- Record status / owner changes and reopenings automatically on every upsert.
create or replace function track_ticket_changes() returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' then
    if new.status is distinct from old.status then
      insert into ticket_events values (new.id, coalesce(new.source_modified_at, now()), 'status', old.status, new.status) on conflict do nothing;
      if old.resolved_at is not null and new.resolved_at is null then new.reopen_count := old.reopen_count + 1; end if;
    end if;
    if new.owner_team is distinct from old.owner_team then
      insert into ticket_events values (new.id, coalesce(new.source_modified_at, now()), 'owner_team', old.owner_team, new.owner_team) on conflict do nothing;
    end if;
    if new.priority is distinct from old.priority then
      insert into ticket_events values (new.id, coalesce(new.source_modified_at, now()), 'priority', old.priority::text, new.priority::text) on conflict do nothing;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists tickets_track on tickets;
create trigger tickets_track before update on tickets for each row execute function track_ticket_changes();

-- Minutes the resolution clock was paused (time spent in a pause status).
create or replace function ticket_paused_minutes(p_ticket bigint, p_pause text[], p_until timestamptz)
returns numeric language sql stable as $$
  with s as (
    select at, new_value, lead(at, 1, p_until) over (order by at) as next_at
    from ticket_events where ticket_id = p_ticket and field = 'status'
  )
  select coalesce(sum(extract(epoch from (least(next_at, p_until) - at)) / 60), 0)
  from s where new_value = any(p_pause) and at < p_until
$$;

-- ---------- what the page reads ----------
create or replace view v_ticket_sla as
select
  t.*,
  p.response_min, p.resolution_min,
  (t.resolved_at is null and t.status not in ('Canceled','Cancelled')) as is_open,
  (t.status = any(p.pause_statuses)) as is_paused,
  extract(epoch from (coalesce(t.responded_at, now()) - t.created_at)) / 60 as response_elapsed_min,
  extract(epoch from (coalesce(t.resolved_at, now()) - t.created_at)) / 60
    - ticket_paused_minutes(t.id, p.pause_statuses, coalesce(t.resolved_at, now())) as resolution_elapsed_min
from tickets t
left join sla_policies p on p.ticket_type = t.ticket_type and p.priority = t.priority;

create or replace view v_ticket_sla_status as
select *,
  case when responded_at is null then null else response_elapsed_min <= response_min end as response_met,
  case when resolved_at  is null then null else resolution_elapsed_min <= resolution_min end as resolution_met,
  resolution_elapsed_min / nullif(resolution_min, 0) as sla_used,           -- 0.8 = 80% of time used
  resolution_min - resolution_elapsed_min as minutes_left
from v_ticket_sla;

-- Breach watch: open, not paused, over 75% of resolution time
create or replace view v_breach_watch as
select * from v_ticket_sla_status
where is_open and not is_paused and sla_used >= 0.75
order by priority, minutes_left;

-- Daily flow: opened vs resolved per day
create or replace view v_daily_flow as
with o as (select created_at::date d, count(*) n from tickets group by 1),
     r as (select resolved_at::date d, count(*) n from tickets where resolved_at is not null group by 1)
select coalesce(o.d, r.d) as day, coalesce(o.n, 0) as opened, coalesce(r.n, 0) as resolved
from o full join r on o.d = r.d;

-- Backlog ageing buckets
create or replace view v_backlog_ageing as
select owner_team, priority,
  case when now() - created_at < interval '1 day' then '< 1 day'
       when now() - created_at < interval '3 days' then '1-3 days'
       when now() - created_at < interval '7 days' then '3-7 days'
       when now() - created_at < interval '30 days' then '7-30 days'
       else '> 30 days' end as age_bucket,
  count(*) as tickets
from v_ticket_sla where is_open group by 1, 2, 3;

-- Categories: volume, reopen rate and SLA over the last 30 days (problem candidates)
create or replace view v_category_stats as
select category,
  count(*) as tickets,
  avg(resolution_elapsed_min) filter (where resolved_at is not null) as avg_resolution_min,
  avg((reopen_count > 0)::int) filter (where resolved_at is not null) as reopen_rate,
  avg(resolution_met::int) as resolution_sla,
  (avg((reopen_count > 0)::int) filter (where resolved_at is not null) > 0.04 or avg(resolution_met::int) < 0.9) as problem_candidate
from v_ticket_sla_status
where created_at >= now() - interval '30 days'
group by category;
