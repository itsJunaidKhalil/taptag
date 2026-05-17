-- =========================================================================
-- Analytics Phase 2: event log + daily rollups
-- =========================================================================

create table if not exists analytics_events (
  id bigserial primary key,
  profile_id uuid not null references profiles(id) on delete cascade,
  link_id uuid references social_links(id) on delete set null,
  event_type text not null,
  session_id text,
  visitor_id text,
  country text,
  region text,
  city text,
  device_type text,
  os text,
  browser text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  is_bot boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_profile_created_idx
  on analytics_events (profile_id, created_at desc);

create index if not exists analytics_events_profile_type_created_idx
  on analytics_events (profile_id, event_type, created_at desc);

create table if not exists analytics_daily (
  profile_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  views int not null default 0,
  unique_visitors int not null default 0,
  link_clicks int not null default 0,
  link_shares int not null default 0,
  vcf_downloads int not null default 0,
  contact_saves int not null default 0,
  mobile_views int not null default 0,
  desktop_views int not null default 0,
  primary key (profile_id, date)
);

create index if not exists analytics_daily_profile_date_idx
  on analytics_daily (profile_id, date desc);

alter table analytics_events enable row level security;
alter table analytics_daily enable row level security;

drop policy if exists "Owners read own analytics events" on analytics_events;
create policy "Owners read own analytics events"
  on analytics_events for select
  using (auth.uid() = profile_id);

drop policy if exists "Owners read own analytics daily" on analytics_daily;
create policy "Owners read own analytics daily"
  on analytics_daily for select
  using (auth.uid() = profile_id);

-- Roll up one calendar day (UTC) into analytics_daily.
create or replace function rollup_analytics_daily(p_target_date date default ((now() at time zone 'utc')::date - 1))
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  insert into analytics_daily (
    profile_id,
    date,
    views,
    unique_visitors,
    link_clicks,
    link_shares,
    vcf_downloads,
    contact_saves,
    mobile_views,
    desktop_views
  )
  select
    profile_id,
    p_target_date,
    count(*) filter (where event_type = 'profile_view'),
    count(distinct visitor_id) filter (
      where event_type = 'profile_view' and visitor_id is not null and visitor_id <> ''
    ),
    count(*) filter (where event_type = 'link_click'),
    count(*) filter (where event_type = 'link_share'),
    count(*) filter (where event_type = 'vcf_download'),
    count(*) filter (where event_type = 'contact_save'),
    count(*) filter (
      where event_type = 'profile_view'
        and device_type in ('mobile', 'tablet')
    ),
    count(*) filter (
      where event_type = 'profile_view'
        and device_type = 'desktop'
    )
  from analytics_events
  where is_bot = false
    and created_at >= p_target_date::timestamptz
    and created_at < (p_target_date + 1)::timestamptz
  group by profile_id
  on conflict (profile_id, date) do update set
    views = excluded.views,
    unique_visitors = excluded.unique_visitors,
    link_clicks = excluded.link_clicks,
    link_shares = excluded.link_shares,
    vcf_downloads = excluded.vcf_downloads,
    contact_saves = excluded.contact_saves,
    mobile_views = excluded.mobile_views,
    desktop_views = excluded.desktop_views;

  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

-- Rebuild rollups for the last N UTC days (heals gaps after deploy).
create or replace function rollup_analytics_daily_range(p_days integer default 8)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer := 0;
  v_i integer;
  v_day date;
begin
  for v_i in 0 .. greatest(p_days - 1, 0) loop
    v_day := ((now() at time zone 'utc')::date - v_i);
    v_total := v_total + rollup_analytics_daily(v_day);
  end loop;
  return v_total;
end;
$$;

revoke all on function rollup_analytics_daily(date) from public;
revoke all on function rollup_analytics_daily_range(integer) from public;
grant execute on function rollup_analytics_daily(date) to service_role;
grant execute on function rollup_analytics_daily_range(integer) to service_role;

comment on table analytics_events is 'Append-only analytics event log (Phase 2).';
comment on table analytics_daily is 'Per-profile daily aggregates; populated by rollup_analytics_daily*.';
