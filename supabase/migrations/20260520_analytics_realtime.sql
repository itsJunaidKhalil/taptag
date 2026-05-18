-- =========================================================================
-- Enable Supabase Realtime for analytics_events (live dashboard toasts)
-- Run in SQL Editor if this migration was not applied via CLI.
-- =========================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'analytics_events'
  ) then
    alter publication supabase_realtime add table analytics_events;
  end if;
end $$;
