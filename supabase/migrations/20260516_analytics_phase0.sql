-- =========================================================================
-- Analytics Phase 0: index + RLS (server-only writes)
-- =========================================================================
-- Public inserts go through POST /api/analytics (service role).
-- Owners read their rows via authenticated Supabase client (RLS select).
-- =========================================================================

create index if not exists idx_analytics_profile_timestamp
  on analytics (profile_id, timestamp desc);

drop policy if exists "Anyone can insert analytics" on analytics;

drop policy if exists "Users can read own analytics" on analytics;
create policy "Users can read own analytics"
  on analytics
  for select
  using (auth.uid() = profile_id);

comment on index idx_analytics_profile_timestamp is
  'Dashboard time-range queries: profile_id + ORDER BY timestamp DESC';
