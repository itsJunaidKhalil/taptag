"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Sparkline from "@/components/charts/Sparkline";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonCard, Skeleton } from "@/components/ui/Skeleton";

interface AnalyticsRow {
  id: string;
  profile_id: string;
  event_type: string;
  platform: string | null;
  referrer: string | null;
  timestamp: string;
}

const DAYS_IN_WINDOW = 7;

function bucketByDay(rows: AnalyticsRow[], days = DAYS_IN_WINDOW): number[] {
  const buckets: number[] = Array(days).fill(0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (const r of rows) {
    const d = new Date(r.timestamp);
    if (isNaN(d.getTime())) continue;
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    const diff = Math.floor((now.getTime() - day.getTime()) / 86400000);
    if (diff >= 0 && diff < days) {
      buckets[days - 1 - diff] += 1;
    }
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

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      loadAnalytics(user.id);
    });
  }, [router]);

  const loadAnalytics = async (userId: string) => {
    try {
      const sinceIso = new Date(
        Date.now() - DAYS_IN_WINDOW * 86400000,
      ).toISOString();
      const { data, error } = await supabase
        .from("analytics")
        .select("*")
        .eq("profile_id", userId)
        .gte("timestamp", sinceIso)
        .order("timestamp", { ascending: false })
        .limit(2000);
      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const { stats, series } = useMemo(() => {
    const views = analytics.filter((a) => a.event_type === "profile_view");
    const clicks = analytics.filter((a) => a.event_type === "link_click");
    const mobile = analytics.filter((a) => a.platform === "mobile");
    const desktop = analytics.filter((a) => a.platform === "desktop");
    return {
      stats: {
        totalViews: views.length,
        totalClicks: clicks.length,
        mobileViews: mobile.length,
        desktopViews: desktop.length,
      },
      series: {
        views: bucketByDay(views),
        clicks: bucketByDay(clicks),
        mobile: bucketByDay(mobile),
        desktop: bucketByDay(desktop),
      },
    };
  }, [analytics]);

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
        ) : analytics.length === 0 ? (
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

            <div className="glass p-4 sm:p-6 rounded-3xl shadow-soft-lg">
              <h2 className="text-lg sm:text-xl font-heading font-semibold mb-4">
                Recent Activity
              </h2>
              <ul className="md:hidden space-y-3">
                {analytics.slice(0, 100).map((item) => {
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
                            {item.platform || "Unknown"}
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
                    {analytics.slice(0, 100).map((item) => {
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
                            {item.platform || "Unknown"}
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
