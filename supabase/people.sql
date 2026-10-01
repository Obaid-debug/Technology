-- ============================================================
-- Najm Insights: Operations & Resilience staff table (Supabase)
-- Run once in the Supabase SQL Editor, after setup.sql.
-- Staff data itself is NOT in this repository: load it with the separate
-- seed file (kept outside Git), or Supabase's Table Editor > Import CSV.
-- Pay grade is deliberately not stored.
-- ============================================================

create table if not exists public.employees (
  employee_id        integer primary key,
  display_name       text not null,
  job_title          text,
  division           text not null,          -- To Be (CTO approved) structure
  department         text not null,
  section            text,
  unit               text,
  supervisor         text,                   -- HR format "Last, First Middle"
  employee_class     text,                   -- Permanent / Outsource
  direct_reports     integer not null default 0,
  start_date         date,
  is_shift           boolean not null default false,
  current_division   text,                   -- current HR structure (for the transition view)
  current_department text,
  current_section    text,
  current_unit       text,
  updated_at         timestamptz not null default now()
);

create index if not exists employees_department_idx on public.employees (department);

-- Personal data: only signed-in users can read; nobody can write through the API
-- (load and edit staff from the Supabase dashboard).
alter table public.employees enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'employees' and policyname = 'employees_read_signed_in') then
    create policy employees_read_signed_in on public.employees for select to authenticated using (true);
  end if;
end $$;
revoke all on public.employees from anon;
