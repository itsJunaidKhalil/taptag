"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Sparkline from "@/components/charts/Sparkline";
import AnalyticsTrendChart from "@/components/charts/AnalyticsTrendChart";
import LinkDrilldownModal from "@/components/analytics/LinkDrilldownModal";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonCard, Skeleton } from "@/components/ui/Skeleton";
import PlatformIcon from "@/components/PlatformIcon";
import { getPlatform } from "@/lib/platforms";
import type { LinkWithStats } from "@/lib/analytics/link-stats";
import {
  ANALYTICS_DASHBOARD_DAYS,
  ActivityRow,
  DailyRow,
  buildSeriesFromDaily,
  buildTrendChartData,
  mapEventToActivity,
  mapLegacyToActivity,
  sumDaily,
} from "@/lib/analytics/dashboard";

const DAYS_IN_WINDOW = ANALYTICS_DASHBOARD_DAYS;

function bucketActivityByDay(
  rows: ActivityRow[],
  eventType: string,
  days = DAYS_IN_WINDOW,
): number[] {
  const buckets: number[] = Array(days).fill(0);
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  for (const r of rows) {
    if (r.event_type !== eventType) continue;
    const d = new Date(r.timestamp);
    if (isNaN(d.getTime())) continue;
    const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const diff = Math.floor((now.getTime() - day.getTime()) / 86400000);
    if (diff >= 0 && diff < days) buckets[days - 1 - diff] += 1;
  }
  return buckets;
}

function eventBadge(eventType: string) {
  switch (eventType) {
    case "profile_view":
      return {
        label: "View",
        className:
          "bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200",
      };
    case "link_click":
      return {
        label: "Click",
        className:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
      };
    case "link_share":
      return {
        label: "Share",
        className: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
      };
    case "vcf_download":
      return {
        label: "VCF",
        className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
      };
    default:
      return {
        label: eventType.replace(/_/g, " "),
        className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      };
  }
}

function formatReferrer(referrer: string | null) {
  if (!referrer || referrer === "direct") return "Direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host || referrer;
  } catch {
    return referrer.length > 48 ? `${referrer.slice(0, 45)}…` : referrer;
  }
}

function formatActivityTime(timestamp: string) {
  const d = new Date(timestamp);
  return {
    date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

function displayPlatform(item: ActivityRow): string {
  if (item.platform) return item.platform;
  if (item.device_type === "tablet") return "tablet";
  if (item.device_type) return item.device_type;
  return "Unknown";
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [linkStats, setLinkStats] = useState<LinkWithStats[]>([]);
  const [drilldownLink, setDrilldownLink] = useState<LinkWithStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      loadAnalytics(user.id);
      loadLinkStats();
    });
  }, [router]);

  const loadLinkStats = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) return;
      const res = await fetch("/api/dashboard/link-analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      setLinkStats(json.links ?? []);
    } catch {
      /* optional */
    }
  };

  const loadAnalytics = async (userId: string) => {
    try {
      const sinceDate = new Date(Date.now() - DAYS_IN_WINDOW * 86400000)
        .toISOString()
        .slice(0, 10);
      const sinceIso = new Date(Date.now() - DAYS_IN_WINDOW * 86400000).toISOString();

      const [dailyRes, eventsRes] = await Promise.all([
        supabase
          .from("analytics_daily")
          .select("*")
          .eq("profile_id", userId)
          .gte("date", sinceDate)
          .order("date", { ascending: true }),
        supabase
          .from("analytics_events")
          .select("id, event_type, device_type, referrer, created_at")
          .eq("profile_id", userId)
          .eq("is_bot", false)
          .gte("created_at", sinceIso)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (!dailyRes.error && dailyRes.data) {
        setDaily(dailyRes.data as DailyRow[]);
      }

      if (!eventsRes.error) {
        setActivity((eventsRes.data ?? []).map(mapEventToActivity));
        return;
      }

      const { data: legacy, error: legacyError } = await supabase
        .from("analytics")
        .select("*")
        .eq("profile_id", userId)
        .gte("timestamp", sinceIso)
        .order("timestamp", { ascending: false })
        .limit(100);

      if (legacyError) throw legacyError;
      setActivity((legacy || []).map(mapLegacyToActivity));
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const { stats, series, trendData, hasData } = useMemo(() => {
    const useDaily = daily.length > 0;
    const totalViews = useDaily
      ? sumDaily(daily, (r) => r.views)
      : activity.filter((a) => a.event_type === "profile_view").length;
    const totalClicks = useDaily
      ? sumDaily(daily, (r) => r.link_clicks)
      : activity.filter((a) => a.event_type === "link_click").length;
    const mobileViews = useDaily
      ? sumDaily(daily, (r) => r.mobile_views)
      : activity.filter(
          (a) =>
            a.event_type === "profile_view" &&
            (a.platform === "mobile" || a.device_type === "mobile" || a.device_type === "tablet"),
        ).length;
    const desktopViews = useDaily
      ? sumDaily(daily, (r) => r.desktop_views)
      : activity.filter(
          (a) => a.event_type === "profile_view" && a.platform === "desktop",
        ).length;

    const hasData =
      totalViews + totalClicks > 0 ||
      activity.some((a) => a.event_type === "link_share" || a.event_type === "vcf_download");

    return {
      hasData,
      stats: { totalViews, totalClicks, mobileViews, desktopViews },
      series: useDaily
        ? {
            views: buildSeriesFromDaily(daily, DAYS_IN_WINDOW, (r) => r.views),
            clicks: buildSeriesFromDaily(daily, DAYS_IN_WINDOW, (r) => r.link_clicks),
            mobile: buildSeriesFromDaily(daily, DAYS_IN_WINDOW, (r) => r.mobile_views),
            desktop: buildSeriesFromDaily(daily, DAYS_IN_WINDOW, (r) => r.desktop_views),
          }
        : {
            views: bucketActivityByDay(activity, "profile_view"),
            clicks: bucketActivityByDay(activity, "link_click"),
            mobile: bucketActivityByDay(
              activity.filter(
                (a) =>
                  a.event_type === "profile_view" &&
                  (a.platform === "mobile" ||
                    a.device_type === "mobile" ||
                    a.device_type === "tablet"),
              ),
              "profile_view",
            ),
            desktop: bucketActivityByDay(
              activity.filter(
                (a) =>
                  a.event_type === "profile_view" &&
                  (a.platform === "desktop" || a.device_type === "desktop"),
              ),
              "profile_view",
            ),
          },
      trendData: useDaily ? buildTrendChartData(daily, DAYS_IN_WINDOW) : [],
    };
  }, [daily, activity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold gradient-text mb-2">
            Analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Last {DAYS_IN_WINDOW} days
          </p>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
            <div className="glass p-4 sm:p-6 rounded-3xl shadow-soft-lg space-y-3">
              <Skeleton className="h-4 w-40" rounded="md" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" rounded="xl" />
              ))}
            </div>
          </>
        ) : !hasData && activity.length === 0 ? (
          <EmptyState
            illustration="analytics"
            title="No data yet"
            description={`Share your profile to start collecting views and clicks. Stats from the last ${DAYS_IN_WINDOW} days will show here.`}
            ctaLabel="View my profile"
            ctaHref={user?.user_metadata?.username ? `/${user.user_metadata.username}` : "/dashboard"}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatCard
                label="Profile Views"
                value={stats.totalViews}
                data={series.views}
                stroke="#6366f1"
              />
              <StatCard
                label="Link Clicks"
                value={stats.totalClicks}
                data={series.clicks}
                stroke="#8b5cf6"
              />
              <StatCard
                label="Mobile Views"
                value={stats.mobileViews}
                data={series.mobile}
                stroke="#10b981"
              />
              <StatCard
                label="Desktop Views"
                value={stats.desktopViews}
                data={series.desktop}
                stroke="#f59e0b"
              />
            </div>

            {linkStats.length > 0 && (
              <div className="glass p-4 sm:p-6 rounded-3xl shadow-soft-lg mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-heading font-semibold mb-4">
                  Top links
                </h2>
                <ul className="space-y-2">
                  {linkStats
                    .filter((l) => l.clicksThisWeek > 0)
                    .slice(0, 8)
                    .map((link) => {
                      const platform = getPlatform(link.platform);
                      return (
                        <li key={link.id}>
                          <button
                            type="button"
                            onClick={() => setDrilldownLink(link)}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-200/70 dark:border-gray-700/70 hover:bg-white/60 dark:hover:bg-gray-800/40 transition-colors text-left"
                          >
                            <PlatformIcon platform={link.platform} className="w-8 h-8 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {link.title || platform?.name || link.platform}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {link.clicksThisWeek} click{link.clicksThisWeek === 1 ? "" : "s"} ·
                                Tap for details
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                </ul>
                {linkStats.every((l) => l.clicksThisWeek === 0) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No link clicks this week yet.
                  </p>
                )}
              </div>
            )}

            {trendData.length > 0 && (
              <div className="glass p-4 sm:p-6 rounded-3xl shadow-soft-lg mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-heading font-semibold mb-1">
                  Views &amp; clicks
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Daily totals (UTC)
                </p>
                <AnalyticsTrendChart data={trendData} />
              </div>
            )}

            <div className="glass p-4 sm:p-6 rounded-3xl shadow-soft-lg">
              <h2 className="text-lg sm:text-xl font-heading font-semibold mb-4">
                Recent Activity
              </h2>
              <ul className="md:hidden space-y-3">
                {activity.map((item) => {
                  const badge = eventBadge(item.event_type);
                  const { date, time } = formatActivityTime(item.timestamp);
                  return (
                    <li
                      key={item.id}
                      className="rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-white/50 dark:bg-gray-900/40 p-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 text-right tabular-nums">
                          {date}
                          <span className="mx-1 opacity-40">·</span>
                          {time}
                        </span>
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <div>
                          <dt className="text-gray-500 dark:text-gray-400 font-medium">Platform</dt>
                          <dd className="mt-0.5 capitalize text-gray-900 dark:text-gray-100 font-medium">
                            {displayPlatform(item)}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-gray-500 dark:text-gray-400 font-medium">Referrer</dt>
                          <dd
                            className="mt-0.5 text-gray-900 dark:text-gray-100 font-medium truncate"
                            title={item.referrer || "Direct"}
                          >
                            {formatReferrer(item.referrer)}
                          </dd>
                        </div>
                      </dl>
                    </li>
                  );
                })}
              </ul>

              <div className="hidden md:block overflow-x-auto -mx-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                      <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">
                        Event
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">
                        Platform
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">
                        Referrer
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.map((item) => {
                      const badge = eventBadge(item.event_type);
                      const { date, time } = formatActivityTime(item.timestamp);
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100/60 dark:border-gray-800/60 last:border-0"
                        >
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 capitalize text-gray-800 dark:text-gray-200">
                            {displayPlatform(item)}
                          </td>
                          <td
                            className="py-3 px-3 text-gray-800 dark:text-gray-200 max-w-[280px] truncate"
                            title={item.referrer || "Direct"}
                          >
                            {formatReferrer(item.referrer)}
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400 whitespace-nowrap tabular-nums">
                            {date}{" "}
                            <span className="text-gray-400 dark:text-gray-500">{time}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <LinkDrilldownModal
              open={!!drilldownLink}
              onOpenChange={(open) => !open && setDrilldownLink(null)}
              link={drilldownLink}
              profileId={user?.id ?? ""}
            />
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  data,
  stroke,
}: {
  label: string;
  value: number;
  data: number[];
  stroke: string;
}) {
  return (
    <div className="glass p-4 sm:p-6 rounded-3xl shadow-soft-lg flex flex-col gap-3">
      <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </h3>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl sm:text-3xl font-heading font-bold leading-none">{value}</p>
      </div>
      <div className="-mx-1 mt-1">
        <Sparkline data={data} height={32} stroke={stroke} ariaLabel={`${label} trend`} />
      </div>
    </div>
  );
}
