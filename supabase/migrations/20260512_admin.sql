-- =========================================================================
-- Admin role + reports lifecycle + audit log
-- =========================================================================
-- - Adds a coarse role column to profiles ('user' | 'admin'). All admin
--   API routes verify role server-side with the service role key, so
--   RLS does not need to enforce this.
-- - Extends the reports table with status transitions so the reports
--   queue can mark items resolved/dismissed.
-- - Adds an audit_log table the admin pages write to whenever a
--   destructive action runs (hard delete, report resolution, role
--   change, etc.).
-- =========================================================================

-- ---- 1. profiles.role -----------------------------------------------------
alter table profiles add column if not exists role text not null default 'user';

-- Restrict to a tight enum-like check. Drop+recreate so the migration is
-- safe to re-run.
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add  constraint profiles_role_check
  check (role in ('user', 'admin'));

create index if not exists idx_profiles_role
  on profiles (role)
  where role = 'admin';

comment on column profiles.role is
  'Coarse access role. Values: ''user'' (default) or ''admin''. All admin endpoints check this server-side via the service role key.';

-- ---- 2. reports lifecycle -------------------------------------------------
-- The base reports table already exists (created in 20260510). We extend
-- it with the columns the admin queue needs to triage submissions.
alter table reports add column if not exists resolved_at      timestamptz;
alter table reports add column if not exists resolved_by      uuid references profiles(id) on delete set null;
alter table reports add column if not exists resolution_note  text;

create index if not exists idx_reports_status_created
  on reports (status, created_at desc);

-- Bring older rows in line with the new enum-friendly statuses.
update reports set status = 'open' where status is null;

-- ---- 2b. Cascade FKs on dependent tables ----------------------------------
-- The base schema declared `social_links.user_id` and `analytics.profile_id`
-- without `ON DELETE CASCADE`, which would cause hard-deletes to fail.
-- Re-create both with cascade so administrative + GDPR-driven deletes
-- propagate cleanly. Idempotent: drops the FK if it exists with any name,
-- then re-adds it with the canonical name + cascade.
do $$
declare
  c record;
begin
  for c in
    select tc.constraint_name
      from information_schema.table_constraints tc
     where tc.table_schema = 'public'
       and tc.table_name   = 'social_links'
       and tc.constraint_type = 'FOREIGN KEY'
  loop
    execute format('alter table social_links drop constraint %I', c.constraint_name);
  end loop;

  for c in
    select tc.constraint_name
      from information_schema.table_constraints tc
     where tc.table_schema = 'public'
       and tc.table_name   = 'analytics'
       and tc.constraint_type = 'FOREIGN KEY'
  loop
    execute format('alter table analytics drop constraint %I', c.constraint_name);
  end loop;
end $$;

alter table social_links
  add constraint social_links_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;

alter table analytics
  add constraint analytics_profile_id_fkey
  foreign key (profile_id) references profiles(id) on delete cascade;

-- ---- 3. audit_log ---------------------------------------------------------
create table if not exists audit_log (
  id           bigserial primary key,
  actor_id     uuid references profiles(id) on delete set null,
  action       text not null,
  target_kind  text,
  target_id    text,
  meta         jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists idx_audit_log_created_at
  on audit_log (created_at desc);
create index if not exists idx_audit_log_actor
  on audit_log (actor_id, created_at desc);

alter table audit_log enable row level security;

-- Audit log is admin-only. RLS denies everything by default; the admin
-- API routes use the service role key which bypasses RLS.
drop policy if exists "audit_log no public access" on audit_log;

comment on table audit_log is
  'Append-only record of administrative actions. Written by the admin API routes (with the service role key) and not directly readable by end users.';

-- ---- 4. Seed initial admin -----------------------------------------------
-- Grants admin role to a specific operator account. Looks the user up by
-- email in auth.users to avoid hard-coding a uuid. Safe to re-run.
do $$
declare
  v_user_id uuid;
begin
  select id
    into v_user_id
    from auth.users
   where lower(email) = lower('itsjunaidkhalil@gmail.com')
   limit 1;

  if v_user_id is not null then
    -- Ensure a profile row exists so the role update has somewhere to land
    -- even if the account never finished onboarding.
    insert into profiles (id, role)
    values (v_user_id, 'admin')
    on conflict (id) do update set role = 'admin';
  end if;
end $$;

-- =========================================================================
-- Done. Summary:
--   - profiles.role                     ('user' | 'admin', default 'user')
--   - reports.resolved_at / _by / _note (queue actions)
--   - audit_log table                   (records all admin mutations)
--   - itsjunaidkhalil@gmail.com seeded  (idempotent if user exists)
-- =========================================================================
