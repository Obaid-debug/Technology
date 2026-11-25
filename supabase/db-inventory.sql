-- ============================================================
-- Database Inventory schema (PostgreSQL 14+)
--
-- Backs Platform & Infrastructure > Database Inventory in the portal.
-- Designed for an internal PostgreSQL (e.g. on OpenShift); it also runs on
-- Supabase. Safe to re-run.
--
-- Principle: every column has ONE owner.
--   * auto     - written only by collectors (versions, sizes, backups, lag…)
--   * inferred - written by rules (environment, proxy path)
--   * manual   - written by people in the portal (project, owner, DBA…)
-- Collectors never overwrite manual columns and people cannot edit auto
-- columns, so the two never fight. Freshness comes from last_seen_at and
-- the collector_runs table.
--
-- No passwords or secrets are stored here. Collector credentials live in
-- the vault (HashiCorp Vault / CyberArk); this schema only names the
-- connection endpoint.
-- ============================================================

-- ---------- reference ----------
create table if not exists environments (
  code        text primary key,                 -- P, B, S, U, T, D
  name        text not null unique,             -- Production, DR, Staging, UAT, Testing, Development
  sort_order  int  not null,
  backup_rpo_hours      int not null,           -- max hours between backups
  restore_test_days     int,                    -- null = not required
  max_replica_lag_sec   int,
  host_prefix  text,                            -- rule: host name starts with this
  network_cidr cidr                             -- rule: IP inside this network
);

insert into environments (code, name, sort_order, backup_rpo_hours, restore_test_days, max_replica_lag_sec, host_prefix, network_cidr) values
  ('P', 'Production',  1, 24,  90, 60,   'p-', '198.18.10.0/24'),
  ('B', 'DR',          2, 24,  90, 60,   'b-', '198.18.20.0/24'),
  ('S', 'Staging',     3, 48,  null, null, 's-', '198.18.30.0/24'),
  ('U', 'UAT',         4, 48,  null, null, 'u-', '198.18.40.0/24'),
  ('T', 'Testing',     5, 168, null, null, 't-', '198.18.50.0/24'),
  ('D', 'Development', 6, 168, null, null, 'd-', '198.18.60.0/24')
on conflict (code) do nothing;

create table if not exists engines (
  name         text primary key,                -- Oracle, SQL Server, PostgreSQL, MySQL, MongoDB, Redis
  default_port int not null
);
insert into engines values ('Oracle',1521),('SQL Server',1433),('PostgreSQL',5432),('MySQL',3306),('MongoDB',27017),('Redis',6379)
on conflict do nothing;

-- Vendor lifecycle per version; maintained by DBAs (or a feed such as endoflife.date).
create table if not exists engine_versions (
  engine        text not null references engines(name),
  version       text not null,                  -- 19c, 2019, 16 …
  latest_patch  text,                           -- 19.25, CU29, 16.6 …
  support_ends  date,                           -- end of vendor support
  primary key (engine, version)
);

-- ---------- ownership (manual) ----------
create table if not exists projects (
  id            bigint generated always as identity primary key,
  name          text not null unique,           -- "Project Name"
  owner_team    text,
  criticality   text check (criticality in ('Critical','High','Medium','Low')),
  data_class    text check (data_class in ('Personal','Financial','Internal','Public')),
  created_at    timestamptz not null default now()
);

-- ---------- where databases run (auto) ----------
create table if not exists hosts (
  id            bigint generated always as identity primary key,
  hostname      text not null unique,
  ip            inet not null,
  os            text,
  vm_cluster    text,                           -- from vCenter
  data_center   text,
  last_seen_at  timestamptz
);

-- One running engine: an Oracle instance/RAC, a SQL Server instance/AG,
-- a PostgreSQL cluster, a MongoDB replica set member …
create table if not exists db_instances (
  id              bigint generated always as identity primary key,
  host_id         bigint references hosts(id) on delete set null,
  engine          text not null references engines(name),
  version         text,                         -- auto
  patch           text,                         -- auto
  instance_name   text,                         -- SID, instance, cluster name
  port            int,                          -- auto
  role            text check (role in ('Primary','Standby','Replica','Standalone')),  -- auto
  primary_id      bigint references db_instances(id),   -- standby -> its primary (auto)
  replication_tech text,                        -- Data Guard, Always On AG, streaming …
  status          text not null default 'Unknown' check (status in ('Online','Offline','Unknown')),
  tls_cert_expires date,                        -- auto
  collector       text,                         -- which collector owns this row
  last_seen_at    timestamptz,                  -- auto; drives "not seen > 7 days"
  unique (host_id, engine, port, instance_name)
);

-- ---------- the inventory row the portal shows ----------
create table if not exists databases (
  id              bigint generated always as identity primary key,
  instance_id     bigint not null references db_instances(id) on delete cascade,
  name            text not null,                -- "Database Name"            (auto)
  -- connection path (inferred from proxy configs, editable)
  ip              inet not null,                -- "IP"                       (auto)
  ip_type         text not null default 'Server IP'
                  check (ip_type in ('Server IP','VIP','SCAN','AG Listener','Listener')),  -- "(Type)"
  port            int  not null,                -- "Port"
  proxy           text not null default 'Direct',  -- "Proxy / Connection": PgBouncer, AG Listener, F5 …
  endpoint        text,                         -- host:port/service, no credentials
  -- classification
  environment     text references environments(code),  -- inferred; null = Unclassified
  environment_rule text,                        -- which rule decided it
  -- ownership (manual)
  project_id      bigint references projects(id) on delete set null,
  dba_username    text,
  owner_confirmed_at timestamptz,               -- quarterly review
  -- size (auto)
  size_gb         numeric(12,2),
  allocated_gb    numeric(12,2),
  -- lifecycle
  source          text not null default 'auto' check (source in ('auto','manual','import')),
  retired_at      timestamptz,
  last_seen_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (instance_id, name)
);
create index if not exists databases_env_idx on databases (environment) where retired_at is null;
create index if not exists databases_project_idx on databases (project_id);

-- ---------- time series written by collectors ----------
create table if not exists backup_runs (
  id            bigint generated always as identity primary key,
  database_id   bigint not null references databases(id) on delete cascade,
  tool          text not null,                  -- RMAN, Commvault, pgBackRest …
  backup_type   text not null,                  -- Full, Incremental, Log
  started_at    timestamptz not null,
  finished_at   timestamptz,
  status        text not null check (status in ('Success','Failed','Running')),
  size_gb       numeric(12,2),
  unique (database_id, tool, started_at)
);
create index if not exists backup_runs_latest_idx on backup_runs (database_id, finished_at desc);

create table if not exists restore_tests (
  id            bigint generated always as identity primary key,
  database_id   bigint not null references databases(id) on delete cascade,
  tested_at     timestamptz not null,
  result        text not null check (result in ('Success','Failed')),
  restore_minutes int,                          -- measured RTO
  ticket        text,
  tested_by     text
);

create table if not exists replication_samples (
  instance_id   bigint not null references db_instances(id) on delete cascade,
  sampled_at    timestamptz not null,
  lag_seconds   int not null,
  primary key (instance_id, sampled_at)
);

create table if not exists size_samples (
  database_id   bigint not null references databases(id) on delete cascade,
  sampled_on    date not null,
  size_gb       numeric(12,2) not null,
  primary key (database_id, sampled_on)
);

create table if not exists privileged_accounts (
  instance_id   bigint not null references db_instances(id) on delete cascade,
  account       text not null,
  privilege     text not null,                  -- DBA, SYSDBA, sysadmin, superuser …
  last_login_at timestamptz,
  seen_at       timestamptz not null default now(),
  primary key (instance_id, account, privilege)
);

-- ---------- keeping it current ----------
create table if not exists collector_runs (
  id            bigint generated always as identity primary key,
  collector     text not null,                  -- Oracle OEM, SQL Server CMS, vCenter host mapping …
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  status        text not null check (status in ('Running','OK','Warning','Failed')),
  records_seen  int,
  records_changed int,
  message       text
);
create index if not exists collector_runs_latest_idx on collector_runs (collector, started_at desc);

-- Found by a collector but not yet in the inventory ("Register" in the portal)
create table if not exists discovered_unregistered (
  id            bigint generated always as identity primary key,
  collector     text not null,
  hostname      text,
  ip            inet,
  engine        text,
  version       text,
  database_name text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  dismissed_at  timestamptz,
  unique (collector, ip, database_name)
);

-- Full history: who / which collector changed which field, old -> new
create table if not exists change_log (
  id            bigint generated always as identity primary key,
  table_name    text not null,
  row_id        bigint not null,
  field         text not null,
  old_value     text,
  new_value     text,
  changed_by    text not null,                  -- username or 'collector:<name>'
  changed_at    timestamptz not null default now()
);
create index if not exists change_log_row_idx on change_log (table_name, row_id, changed_at desc);

create or replace function log_database_changes() returns trigger language plpgsql as $$
declare k text; o jsonb := to_jsonb(old); n jsonb := to_jsonb(new);
begin
  new.updated_at := now();
  for k in select jsonb_object_keys(n) loop
    if k not in ('updated_at','last_seen_at') and (o -> k) is distinct from (n -> k) then
      insert into change_log (table_name, row_id, field, old_value, new_value, changed_by)
      values (tg_table_name, new.id, k, o ->> k, n ->> k, coalesce(current_setting('app.actor', true), current_user));
    end if;
  end loop;
  return new;
end $$;
drop trigger if exists databases_log on databases;
create trigger databases_log before update on databases for each row execute function log_database_changes();
drop trigger if exists db_instances_log on db_instances;
create trigger db_instances_log before update on db_instances for each row execute function log_database_changes();

-- ---------- what the portal reads ----------
create or replace view v_database_inventory as
select
  d.id,
  p.name                       as project_name,
  d.name                       as database_name,
  i.engine || ' ' || coalesce(i.version, '') as database_type,
  host(d.ip) || ' (' || d.ip_type || ')'     as ip_type,
  d.port,
  d.proxy || coalesce(' — ' || d.endpoint, '') as proxy_connection,
  coalesce(e.name, 'Unclassified') as environment,
  i.role, i.status, i.patch, ev.latest_patch,
  (ev.support_ends < current_date) as end_of_life,
  d.size_gb, d.allocated_gb,
  b.finished_at                as last_backup_at,
  (b.finished_at is null or b.finished_at < now() - make_interval(hours => coalesce(e.backup_rpo_hours, 168))) as backup_overdue,
  rt.tested_at                 as last_restore_test_at,
  rs.lag_seconds               as replica_lag_seconds,
  i.tls_cert_expires,
  p.owner_team, d.dba_username, d.owner_confirmed_at,
  greatest(d.last_seen_at, i.last_seen_at) as last_seen_at,
  (greatest(d.last_seen_at, i.last_seen_at) < now() - interval '7 days') as stale
from databases d
join db_instances i      on i.id = d.instance_id
left join projects p     on p.id = d.project_id
left join environments e on e.code = d.environment
left join engine_versions ev on ev.engine = i.engine and ev.version = i.version
left join lateral (select finished_at from backup_runs br where br.database_id = d.id and br.status = 'Success' order by finished_at desc limit 1) b on true
left join lateral (select tested_at from restore_tests t where t.database_id = d.id and t.result = 'Success' order by tested_at desc limit 1) rt on true
left join lateral (select lag_seconds from replication_samples s where s.instance_id = i.id order by sampled_at desc limit 1) rs on true
where d.retired_at is null;

-- Data-quality checks (Data quality & sync tab)
create or replace view v_inventory_issues as
select id, database_name, 'Not seen for 7+ days' as issue from v_database_inventory where stale
union all select id, database_name, 'Backup overdue' from v_database_inventory where backup_overdue and environment <> 'Unclassified'
union all select id, database_name, 'No environment' from v_database_inventory where environment = 'Unclassified'
union all select id, database_name, 'No project / owner' from v_database_inventory where project_name is null or owner_team is null
union all select id, database_name, 'No DBA' from v_database_inventory where dba_username is null
union all select id, database_name, 'Owner review due' from v_database_inventory where owner_confirmed_at is null or owner_confirmed_at < now() - interval '90 days'
union all select id, database_name, 'End of life' from v_database_inventory where end_of_life;

-- Assign environment by rule (run after each sync). Manual overrides are kept
-- when environment_rule = 'manual'.
create or replace function classify_environments() returns int language plpgsql as $$
declare n int;
begin
  update databases d set environment = e.code, environment_rule = 'network ' || e.network_cidr
  from environments e
  where d.ip << e.network_cidr and d.environment is distinct from e.code and coalesce(d.environment_rule, '') <> 'manual';
  get diagnostics n = row_count;
  return n;
end $$;
