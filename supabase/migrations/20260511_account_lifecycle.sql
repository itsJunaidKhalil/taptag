-- =========================================================================
-- Account lifecycle (GDPR): soft-delete with 30-day recovery window
-- =========================================================================
-- This migration adds the columns and indexes required to mark a profile
-- as "scheduled for deletion" without immediately removing it, so users
-- can recover the account inside the recovery window (30 days by default).
--
-- A separate scheduled job (Supabase scheduled function or external cron)
-- should permanently delete rows where:
--    deleted_at IS NOT NULL AND scheduled_deletion_at <= now()
-- =========================================================================

alter table profiles
  add column if not exists deleted_at timestamptz,
  add column if not exists scheduled_deletion_at timestamptz;

-- Used by the public profile lookup so soft-deleted accounts return 404
-- without scanning every row in the table.
create index if not exists idx_profiles_deleted_at
  on profiles (deleted_at)
  where deleted_at is null;

-- Used by the future hard-delete cron to find rows past their grace period.
create index if not exists idx_profiles_scheduled_deletion
  on profiles (scheduled_deletion_at)
  where deleted_at is not null;

comment on column profiles.deleted_at is
  'Timestamp when the user requested account deletion. Profile is hidden from public lookups while this is set.';
comment on column profiles.scheduled_deletion_at is
  'Timestamp at which the row will be permanently deleted by the purge cron. Typically deleted_at + 30 days.';
