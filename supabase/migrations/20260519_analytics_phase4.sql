-- =========================================================================
-- Analytics Phase 4: digest opt-in control
-- =========================================================================

alter table profiles
  add column if not exists weekly_digest_enabled boolean not null default true;

comment on column profiles.weekly_digest_enabled is
  'When false, skip weekly analytics summary emails for this account.';
