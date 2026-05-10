-- TapTag Tier 1 overhaul migration
-- Safe to run on production: every change is additive and idempotent.
-- Run this in Supabase SQL editor, or `supabase db push` if you use the CLI.

-- =====================================================================
-- 1. New columns on profiles
-- =====================================================================
alter table profiles add column if not exists onboarding_completed_at timestamptz;

-- =====================================================================
-- 2. New columns on social_links (room for "block types" in Tier 2)
-- =====================================================================
alter table social_links add column if not exists block_type   text default 'link';
alter table social_links add column if not exists title        text;
alter table social_links add column if not exists subtitle     text;
alter table social_links add column if not exists thumbnail_url text;
alter table social_links add column if not exists is_featured  boolean default false;
alter table social_links add column if not exists is_visible   boolean default true;

-- =====================================================================
-- 3. Indexes for performance
-- =====================================================================
create index if not exists idx_social_links_user_order
  on social_links (user_id, order_index);

create unique index if not exists idx_profiles_username_lower
  on profiles (lower(username))
  where username is not null;

-- =====================================================================
-- 4. Reports table (used by /api/reports + ReportModal)
-- =====================================================================
create table if not exists reports (
  id bigserial primary key,
  profile_id uuid references profiles(id) on delete cascade,
  reported_username text,
  reason text not null,
  details text,
  status text default 'open',
  created_at timestamptz default now()
);

alter table reports enable row level security;

-- Anyone can submit a report (no spam protection beyond app-side rate limits)
drop policy if exists "Anyone can submit a report" on reports;
create policy "Anyone can submit a report"
  on reports for insert
  with check (true);

-- Only service role can read reports (handled in admin tooling)
-- Default RLS denies public select, which is what we want here.

-- =====================================================================
-- 5. Atomic bulk-reorder Postgres function
-- =====================================================================
-- Used by /api/social/reorder. Updates order_index for many rows
-- in a single transaction without N round trips.
create or replace function reorder_social_links(
  p_user_id uuid,
  p_ordered_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  i int;
  link_id uuid;
begin
  for i in 1..array_length(p_ordered_ids, 1) loop
    link_id := p_ordered_ids[i];
    update social_links
       set order_index = i - 1
     where id = link_id
       and user_id = p_user_id;
  end loop;
end;
$$;

revoke all on function reorder_social_links(uuid, uuid[]) from public;
grant execute on function reorder_social_links(uuid, uuid[]) to service_role;

-- =====================================================================
-- 6. Done. Summary:
--    - profiles.onboarding_completed_at  (controls onboarding wizard)
--    - social_links.block_type/title/.. (Tier 2 ready)
--    - reports table                     (Report modal target)
--    - reorder_social_links() function   (powers drag-and-drop)
-- =====================================================================
