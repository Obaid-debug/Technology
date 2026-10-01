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
  ('ahalfaifi'),
  ('ahmealotaibi'),
  ('alaltamimi'),
  ('atheeb'),
  ('dsridharahal'),
  ('falmarri'),
  ('halsehli'),
  ('iasljah'),
  ('maalabdali'),
  ('mkassem'),
  ('oalfahad.c'),
  ('tshudiyed'),
  ('zalanzi.c'),
  ('zmoumenah'),
  ('salqudyri')
) as v(username)
where not exists (select 1 from public.engineers);

insert into public.services (name, code, primary_engineer, secondary_engineer)
select v.* from (values
  ('Abdea', 'ABE', null, null),
  ('Aber', 'ABR', 'dsridharahal', 'atheeb'),
  ('Abr', 'ABRR', 'mkassem', 'ahalfaifi'),
  ('Absher Ai Assistant', 'AAI', 'atheeb', 'zmoumenah'),
  ('Acceptance Gate', 'AGT', null, null),
  ('AgriServ', 'AGS', 'dsridharahal', 'atheeb'),
  ('Air Community System - ACS', 'AIS', 'iasljah', 'zalanzi.c'),
  ('AJR', 'AJR', 'mkassem', 'falmarri'),
  ('AlUla', null, null, null),
  ('Amili', 'AML', 'iasljah', 'zmoumenah'),
  ('AMN', 'AMN', 'ahmealotaibi', 'alaltamimi'),
  ('Athr', null, null, null),
  ('Basher Photo Analyzer', 'BAP', 'iasljah', 'zalanzi.c'),
  ('Bashir', 'BAS', 'iasljah', 'atheeb'),
  ('Bayan', 'BYN', null, null),
  ('Bayan International', null, null, null),
  ('Bayanat.Tech', null, 'halsehli', 'atheeb'),
  ('Billing System', 'BLS', 'tshudiyed', 'maalabdali'),
  ('Biometric Verification Service', null, 'zmoumenah', null),
  ('BOG - AI Assistant', 'BOGAIA', 'zalanzi.c', 'atheeb'),
  ('Camels Services', null, null, null),
  ('Cargo Gate', 'SAX', null, 'atheeb'),
  ('CCHI', null, 'zmoumenah', 'halsehli'),
  ('Certificate of Origin (COO)', null, null, null),
  ('Certificate of Origin Brazil (COOBrazil)', null, null, null),
  ('Chambers of Commerce - COC', null, null, null),
  ('Citizen Account', 'MSA', 'falmarri', 'alaltamimi'),
  ('City Entry', null, null, null),
  ('Clock Tower Museum', null, 'falmarri', 'alaltamimi'),
  ('Consulting Professions', null, null, null),
  ('Dakhli', null, 'zalanzi.c', 'iasljah'),
  ('Daleel', null, null, null),
  ('Digital Cards Services', null, 'zmoumenah', 'iasljah'),
  ('Digital Products Portal', 'DPP', 'oalfahad.c', 'mkassem'),
  ('Drones', null, null, 'iasljah'),
  ('E-mazad', null, null, null),
  ('E-Wallet', null, null, null),
  ('Efada', 'EMC', 'mkassem', 'oalfahad.c'),
  ('Ehkamm', null, null, null),
  ('Ejaz', 'EJZ', 'halsehli', 'atheeb'),
  ('Najm Notification Platform', null, 'maalabdali', 'falmarri'),
  ('Najm Radar', null, 'iasljah', null),
  ('NajmX', null, 'tshudiyed', 'ahalfaifi'),
  ('Enjz', 'NJZ', null, 'zalanzi.c'),
  ('Environmental Security', null, 'atheeb', 'iasljah'),
  ('ePIL', null, 'tshudiyed', 'mkassem'),
  ('Ertah', 'ERT', 'zalanzi.c', 'atheeb'),
  ('Estbdal', null, 'falmarri', 'alaltamimi'),
  ('Fasah', null, null, null),
  ('Fasah Pay', null, 'iasljah', 'zalanzi.c'),
  ('Fingerprint', null, 'iasljah', 'zmoumenah'),
  ('Fursah', null, 'iasljah', 'zmoumenah'),
  ('GACA-e-services', 'GACAES', 'alaltamimi', 'falmarri'),
  ('GACA - Security Permits V2', null, 'iasljah', null),
  ('GACA - Special Integrated Logistics Zone (SILZ)', null, null, null),
  ('GFRS', null, null, null),
  ('Ghad', null, null, null),
  ('Hajj Permits', null, null, 'atheeb'),
  ('Halal', null, null, null),
  ('HRSD- Verification Services', null, 'zalanzi.c', 'halsehli'),
  ('HUIC Centralization Local Hajj', null, null, null),
  ('I-Abarah', null, null, null),
  ('IAM', 'IAM', 'zmoumenah', 'iasljah'),
  ('Ibhar', null, null, null),
  ('Identify Verification Platform IVP', null, 'zmoumenah', 'zalanzi.c'),
  ('Import and Export', null, 'mkassem', 'maalabdali'),
  ('Inspection Platform', null, 'dsridharahal', 'atheeb'),
  ('IPN-Intellectual Property Notices', null, null, null),
  ('Khibrah', null, 'iasljah', 'halsehli'),
  ('Khutwa', null, 'zalanzi.c', null),
  ('KSCH - Portal', 'KSH', 'oalfahad.c', 'mkassem'),
  ('Kshf', null, 'mkassem', 'tshudiyed'),
  ('Lead Generations', null, 'zalanzi.c', 'zmoumenah'),
  ('Lezam', null, 'iasljah', null),
  ('Maintenance Centers Classification(MCC)', null, null, null),
  ('Marasea V2', null, 'halsehli', null),
  ('Marine Units', null, null, null),
  ('Maritime - NAQL', null, null, null),
  ('Marketplace', null, null, null),
  ('Maroof', null, null, null),
  ('MAS', null, null, null),
  ('MASARAT', null, null, null),
  ('Mawani-AI', null, 'dsridharahal', 'atheeb'),
  ('Mazadat Tameer', null, 'halsehli', 'zalanzi.c'),
  ('MEIM_Addady Platform', null, null, null),
  ('MEWA', 'MEE', 'mkassem', 'falmarri'),
  ('Ministry Council Management System', null, null, null),
  ('MLSD_Tawteen Marketing Specialist', null, null, null),
  ('Mobile Verification', null, 'zalanzi.c', 'iasljah'),
  ('MOEWA', null, 'mkassem', 'falmarri'),
  ('MOI_PSS Traveler_Platform_V01', null, null, null),
  ('Mojaz', null, null, 'atheeb'),
  ('Monther', null, null, null),
  ('Muqeem V3', 'NMQ', 'atheeb', 'halsehli'),
  ('Mustamir', 'SCH', 'tshudiyed', 'oalfahad.c'),
  ('MVPI Version2', null, 'atheeb', 'halsehli'),
  ('Mwathiq', null, null, null),
  ('MWL Islamic platform', null, 'mkassem', 'maalabdali'),
  ('Nafath', 'NFZ', 'zmoumenah', 'iasljah'),
  ('NAJEM', null, 'iasljah', 'atheeb'),
  ('Natheer', 'NAT', 'zmoumenah', 'iasljah'),
  ('Natheer 2', null, 'zmoumenah', 'iasljah'),
  ('National Support Platform', 'NSP', 'falmarri', 'alaltamimi'),
  ('New Naql', null, null, null),
  ('New Yakeen', null, 'zmoumenah', 'iasljah'),
  ('NRSC', null, null, null),
  ('NSP-Portal-CSA', null, 'falmarri', 'alaltamimi'),
  ('Nuha API', null, 'halsehli', 'zmoumenah'),
  ('Nusuk Services', null, null, null),
  ('Omrah', null, 'atheeb', 'iasljah'),
  ('Oqoud', null, 'zalanzi.c', 'zmoumenah'),
  ('Order Publish', null, null, null),
  ('Ostoul', null, 'mkassem', 'tshudiyed'),
  ('Own in Saudi Arabia', 'OSA', 'alaltamimi', null),
  ('Payment Gateway', null, 'tshudiyed', 'maalabdali'),
  ('Port Community System (PCS)', 'TCS', 'dsridharahal', 'zmoumenah'),
  ('Port Management information System (PMIS)', null, 'iasljah', 'zalanzi.c'),
  ('PSI', null, 'tshudiyed', 'maalabdali'),
  ('PSS_Shipping Security systems', null, null, null),
  ('PTA Portal', null, null, null),
  ('Public Benefit Markets', null, 'mkassem', 'oalfahad.c'),
  ('Qaym', 'QYM', 'zalanzi.c', 'zmoumenah'),
  ('Qimah', null, null, null),
  ('Qiyada', null, null, null),
  ('Qradar', null, null, null),
  ('QuickTik', null, null, null),
  ('Rabet', null, 'halsehli', 'zmoumenah'),
  ('Rabet Solutions', null, 'halsehli', 'zmoumenah'),
  ('Rased', null, 'mkassem', 'oalfahad.c'),
  ('RCMC-Informal Settlements Platform', null, 'alaltamimi', null),
  ('Red Sea Authority', null, 'halsehli', 'atheeb'),
  ('Riyadh University of Arts', null, null, null),
  ('Royal Court', 'RYC', 'oalfahad.c', 'mkassem'),
  ('Saber Commercial', null, null, null),
  ('Saber Non-commercial', null, null, null),
  ('Saber Vehicles', null, null, null),
  ('Sailing Permits', null, 'ahmealotaibi', 'tshudiyed'),
  ('Salamah', 'SLM', 'alaltamimi', 'ahmealotaibi'),
  ('Sale', null, null, null),
  ('SASO SSO Identity', null, null, null),
  ('Saudi Council Engineers', null, 'zalanzi.c', 'zmoumenah'),
  ('Saudi Scouts Association', null, null, 'zalanzi.c'),
  ('SCE', null, 'zalanzi.c', 'zmoumenah'),
  ('SDR', null, null, null),
  ('SEEC-EUtilities', null, 'mkassem', 'maalabdali'),
  ('Settle', null, 'zalanzi.c', 'zmoumenah'),
  ('SFDA Faseh', null, null, null),
  ('Shmool', null, null, 'zmoumenah'),
  ('Slasel', null, 'mkassem', 'oalfahad.c'),
  ('Smart Gate', 'SMG', 'mkassem', 'oalfahad.c'),
  ('Subscription System', null, null, null),
  ('Tabadul - Application Prod', null, null, null),
  ('Tabadul - Shared Services', 'TSS', null, null),
  ('Tajeer', 'PTT', null, null),
  ('Tamakkan', null, 'atheeb', null),
  ('TAMM', 'NTM', 'halsehli', 'atheeb'),
  ('TAMM_OLD', null, 'halsehli', 'atheeb'),
  ('TAMWEEN', null, 'zmoumenah', 'dsridharahal'),
  ('Taqeem', 'TAQM', 'oalfahad.c', 'mkassem'),
  ('Tasdeeq', null, 'atheeb', null),
  ('Tasneed', null, null, null),
  ('Tasreeh NWC', null, 'tshudiyed', 'mkassem'),
  ('Tawseel', null, null, null),
  ('Thaki', null, 'zalanzi.c', 'zmoumenah'),
  ('THARA', null, null, null),
  ('TMS', 'TMS', 'oalfahad.c', 'mkassem'),
  ('Torood TGA', null, null, null),
  ('Trademarks', null, null, null),
  ('Unified BI Portal', null, 'halsehli', 'iasljah'),
  ('Unified Logistic Platform', null, null, null),
  ('Vehicle Analytics', null, 'halsehli', 'atheeb'),
  ('Vehicle Data Maintenance', null, 'atheeb', null),
  ('Vehicle Inspection', null, null, null),
  ('VIBAN', null, 'zmoumenah', 'halsehli'),
  ('VOC-Vocational Certificate', null, null, null),
  ('Wahed', null, 'tshudiyed', 'oalfahad.c'),
  ('Waseet', 'WST', 'halsehli', 'iasljah'),
  ('Wasel Portal', 'WSL', null, null),
  ('Washaj', 'WSH', null, null),
  ('Watad', 'WTD', 'oalfahad.c', 'mkassem'),
  ('Watad AI', 'WTA', null, null),
  ('Water Services (Non-Networked)', null, 'falmarri', 'oalfahad.c'),
  ('Wathq', null, null, null),
  ('Yakeen', 'YKL', 'zmoumenah', 'iasljah'),
  ('Yakeen Engine', 'YKE', 'zmoumenah', 'iasljah'),
  ('YakeenMiddlewareOS', null, 'zmoumenah', 'iasljah'),
  ('Zawil', 'ZAW', 'ahmealotaibi', 'tshudiyed'),
  ('Zawil-Diving permits', 'ZDP', 'ahmealotaibi', 'tshudiyed')
) as v(name, code, primary_engineer, secondary_engineer)
where not exists (select 1 from public.services);
