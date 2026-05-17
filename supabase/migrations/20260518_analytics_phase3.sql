-- =========================================================================
-- Analytics Phase 3: public view-count badge opt-in
-- =========================================================================

alter table profiles
  add column if not exists show_public_view_count boolean not null default false;

comment on column profiles.show_public_view_count is
  'When true, show aggregate profile views (last 7 days) on the public card.';
