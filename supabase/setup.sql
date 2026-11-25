-- ============================================================
-- Najm Insights: Service Directory shared database (Supabase)
-- Run once in your Supabase project: SQL Editor > New query > paste > Run.
-- Safe to re-run: tables/policies are created only if missing and the
-- seed rows are inserted only into empty tables.
-- ============================================================

create table if not exists public.engineers (
  username   text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id                 bigint generated always as identity primary key,
  name               text not null unique,
  code               text,
  primary_engineer   text references public.engineers(username) on update cascade on delete set null,
  secondary_engineer text references public.engineers(username) on update cascade on delete set null,
  updated_at         timestamptz not null default now(),
  updated_by         text
);

-- Record who changed a row and when (from the signed-in user's email).
create or replace function public.services_stamp() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.jwt() ->> 'email', new.updated_by);
  return new;
end $$;

drop trigger if exists services_stamp on public.services;
create trigger services_stamp before insert or update on public.services
  for each row execute function public.services_stamp();

-- Row-level security: anyone with the site can read; only signed-in users can change data.
alter table public.services  enable row level security;
alter table public.engineers enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'services' and policyname = 'services_read') then
    create policy services_read on public.services for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'services' and policyname = 'services_write') then
    create policy services_write on public.services for all to authenticated using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'engineers' and policyname = 'engineers_read') then
    create policy engineers_read on public.engineers for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'engineers' and policyname = 'engineers_write') then
    create policy engineers_write on public.engineers for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Seed with the portal's current sample data (only when the tables are empty).
insert into public.engineers (username)
select v.username from (values
  ('user16'),
  ('user12'),
  ('user02'),
  ('user15'),
  ('user14'),
  ('user06'),
  ('user03'),
  ('user17'),
  ('user13'),
  ('user10'),
  ('user19'),
  ('user11'),
  ('user18'),
  ('user07'),
  ('user05')
) as v(username)
where not exists (select 1 from public.engineers);

insert into public.services (name, code, primary_engineer, secondary_engineer)
select v.* from (values
  ('Service S-005', 'C001', null, null),
  ('Service S-006', 'C002', 'user14', 'user15'),
  ('Service S-007', 'C003', 'user10', 'user16'),
  ('Service S-008', 'C004', 'user15', 'user07'),
  ('Service S-009', 'C005', null, null),
  ('Service S-010', 'C006', 'user14', 'user15'),
  ('Service S-011', 'C007', 'user17', 'user18'),
  ('Service S-012', 'Service S-012', 'user10', 'user06'),
  ('Service S-013', null, null, null),
  ('Service S-014', 'C009', 'user17', 'user07'),
  ('Service S-015', 'Service S-015', 'user12', 'user02'),
  ('Service S-016', null, null, null),
  ('Service S-017', 'C011', 'user17', 'user18'),
  ('Service S-018', 'C012', 'user17', 'user15'),
  ('Service S-019', 'C013', null, null),
  ('Service S-020', null, null, null),
  ('Service S-021', null, 'user03', 'user15'),
  ('Service S-022', 'C014', 'user11', 'user13'),
  ('Service S-023', null, 'user07', null),
  ('Service S-024', 'C015', 'user18', 'user15'),
  ('Service S-025', null, null, null),
  ('Service S-026', 'C016', null, 'user15'),
  ('Service S-027', null, 'user07', 'user03'),
  ('Service S-028', null, null, null),
  ('Service S-029', null, null, null),
  ('Service S-030', null, null, null),
  ('Service S-031', 'C017', 'user06', 'user02'),
  ('Service S-032', null, null, null),
  ('Service S-033', null, 'user06', 'user02'),
  ('Service S-034', null, null, null),
  ('Service S-035', null, 'user18', 'user17'),
  ('Service S-036', null, null, null),
  ('Service S-037', null, 'user07', 'user17'),
  ('Service S-038', 'C018', 'user19', 'user10'),
  ('Service S-039', null, null, 'user17'),
  ('Service S-040', null, null, null),
  ('Service S-041', null, null, null),
  ('Service S-042', 'C019', 'user10', 'user19'),
  ('Service S-043', null, null, null),
  ('Service S-044', 'C020', 'user03', 'user15'),
  ('Service S-045', null, 'user13', 'user06'),
  ('Service S-046', null, 'user17', null),
  ('Service S-047', null, 'user11', 'user16'),
  ('Service S-048', 'C021', null, 'user18'),
  ('Service S-049', null, 'user15', 'user17'),
  ('Service S-050', null, 'user11', 'user10'),
  ('Service S-051', 'C022', 'user18', 'user15'),
  ('Service S-052', null, 'user06', 'user02'),
  ('Service S-053', null, null, null),
  ('Service S-054', null, 'user17', 'user18'),
  ('Service S-055', null, 'user17', 'user07'),
  ('Service S-056', null, 'user17', 'user07'),
  ('Service S-057', 'C023', 'user02', 'user06'),
  ('Service S-058', null, 'user17', null),
  ('Service S-059', null, null, null),
  ('Service S-060', null, null, null),
  ('Service S-061', null, null, null),
  ('Service S-062', null, null, 'user15'),
  ('Service S-001', null, null, null),
  ('Service S-063', null, 'user18', 'user03'),
  ('Service S-064', null, null, null),
  ('Service S-065', null, null, null),
  ('Service S-066', 'Service S-066', 'user07', 'user17'),
  ('Service S-067', null, null, null),
  ('Service S-068', null, 'user07', 'user18'),
  ('Service S-069', null, 'user10', 'user13'),
  ('Service S-070', null, 'user14', 'user15'),
  ('Service S-071', null, null, null),
  ('Service S-072', null, 'user17', 'user03'),
  ('Service S-073', null, 'user18', null),
  ('Service S-074', 'C024', 'user19', 'user10'),
  ('Service S-075', null, 'user10', 'user11'),
  ('Service S-076', null, 'user18', 'user07'),
  ('Service S-077', null, 'user17', null),
  ('Service S-078', null, null, null),
  ('Service S-079', null, 'user03', null),
  ('Service S-080', null, null, null),
  ('Service S-081', null, null, null),
  ('Service S-082', null, null, null),
  ('Service S-083', null, null, null),
  ('Service S-084', null, null, null),
  ('Service S-085', null, null, null),
  ('Service S-086', null, 'user14', 'user15'),
  ('Service S-087', null, 'user03', 'user18'),
  ('Service S-088', null, null, null),
  ('Service S-089', 'C025', 'user10', 'user06'),
  ('Service S-090', null, null, null),
  ('Service S-091', null, null, null),
  ('Service S-092', null, 'user18', 'user17'),
  ('Service S-093', null, 'user10', 'user06'),
  ('Service S-094', null, null, null),
  ('Service S-095', null, null, 'user15'),
  ('Service S-096', null, null, null),
  ('Service S-097', 'C026', 'user15', 'user03'),
  ('Service S-098', 'C027', 'user11', 'user19'),
  ('Service S-099', null, 'user15', 'user03'),
  ('Service S-100', null, null, null),
  ('Service S-101', null, 'user10', 'user13'),
  ('Service S-102', 'C028', 'user07', 'user17'),
  ('Service S-103', null, 'user17', 'user15'),
  ('Service S-104', 'C029', 'user07', 'user17'),
  ('Service S-105', null, 'user07', 'user17'),
  ('Service S-002', 'C030', 'user06', 'user02'),
  ('New X096', null, null, null),
  ('New Service S-183', null, 'user07', 'user17'),
  ('Service S-106', null, null, null),
  ('Service S-107', null, 'user06', 'user02'),
  ('Service S-108', null, 'user03', 'user07'),
  ('Service S-109', null, null, null),
  ('Service S-110', null, 'user15', 'user17'),
  ('Service S-111', null, 'user18', 'user07'),
  ('Service S-112', null, null, null),
  ('Service S-113', null, 'user10', 'user11'),
  ('Service S-114', 'C031', 'user02', null),
  ('Service S-115', null, 'user11', 'user13'),
  ('Service S-116', 'C032', 'user14', 'user07'),
  ('Service S-117', null, 'user17', 'user18'),
  ('Service S-118', null, 'user11', 'user13'),
  ('Service S-119', null, null, null),
  ('Service S-120', null, null, null),
  ('Service S-121', null, 'user10', 'user19'),
  ('Service S-122', 'C033', 'user18', 'user07'),
  ('Service S-123', null, null, null),
  ('Service S-124', null, null, null),
  ('Service S-125', null, null, null),
  ('Service S-126', null, null, null),
  ('Service S-127', null, 'user03', 'user07'),
  ('Service S-128', null, 'user03', 'user07'),
  ('Service S-129', null, 'user10', 'user19'),
  ('Service S-130', null, 'user02', null),
  ('Service S-131', null, 'user03', 'user15'),
  ('Service S-132', null, null, null),
  ('Service S-133', 'C034', 'user19', 'user10'),
  ('Service S-134', null, null, null),
  ('Service S-135', null, null, null),
  ('Service S-136', null, null, null),
  ('Service S-137', null, 'user12', 'user11'),
  ('Service S-138', 'C035', 'user02', 'user12'),
  ('Service S-139', null, null, null),
  ('Service S-140', null, null, null),
  ('Service S-141', null, 'user18', 'user07'),
  ('Service S-142', null, null, 'user18'),
  ('Service S-143', null, 'user18', 'user07'),
  ('Service S-144', null, null, null),
  ('Service S-145', null, 'user10', 'user13'),
  ('Service S-146', null, 'user18', 'user07'),
  ('Service S-147', null, null, null),
  ('Service S-148', null, null, 'user07'),
  ('Service S-149', null, 'user10', 'user19'),
  ('Service S-150', 'C036', 'user10', 'user19'),
  ('Service S-151', null, null, null),
  ('Service S-152', null, null, null),
  ('Service S-153', 'C037', null, null),
  ('Service S-154', 'C038', null, null),
  ('Service S-155', null, 'user15', null),
  ('Service S-156', 'C039', 'user03', 'user15'),
  ('Service S-157', null, 'user03', 'user15'),
  ('Service S-158', null, 'user07', 'user14'),
  ('Service S-159', 'C040', 'user19', 'user10'),
  ('Service S-160', null, 'user15', null),
  ('Service S-161', null, null, null),
  ('Service S-162', null, 'user11', 'user10'),
  ('Service S-163', null, null, null),
  ('Service S-164', null, 'user18', 'user07'),
  ('Service S-165', null, null, null),
  ('Service S-166', 'Service S-166', 'user19', 'user10'),
  ('Service S-167', null, null, null),
  ('Service S-168', null, null, null),
  ('Service S-169', null, 'user03', 'user17'),
  ('Service S-170', null, null, null),
  ('Service S-171', null, 'user03', 'user15'),
  ('Service S-172', null, 'user15', null),
  ('Service S-173', null, null, null),
  ('Service S-174', null, 'user07', 'user03'),
  ('Service S-175', null, null, null),
  ('Service S-176', null, 'user11', 'user19'),
  ('Service S-177', 'C042', 'user03', 'user17'),
  ('Service S-178', 'C043', null, null),
  ('Service S-179', 'C044', null, null),
  ('Service S-180', 'C045', 'user19', 'user10'),
  ('Service S-181', 'C046', null, null),
  ('Service S-182', null, 'user06', 'user19'),
  ('Service S-003', null, null, null),
  ('Service S-183', 'C047', 'user07', 'user17'),
  ('Service S-184', 'C048', 'user07', 'user17'),
  ('Service S-185', null, 'user07', 'user17'),
  ('Service S-186', 'C049', 'user12', 'user11'),
  ('Service S-187', 'C050', 'user12', 'user11')
) as v(name, code, primary_engineer, secondary_engineer)
where not exists (select 1 from public.services);
