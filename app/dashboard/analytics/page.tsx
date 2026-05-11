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
              <div className="overflow-x-auto">
                <table className="w-full text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                      <th className="text-left py-2 px-2 sm:px-4 font-medium">Event</th>
                      <th className="text-left py-2 px-2 sm:px-4 font-medium hidden sm:table-cell">
                        Platform
                      </th>
                      <th className="text-left py-2 px-2 sm:px-4 font-medium hidden md:table-cell">
                        Referrer
                      </th>
                      <th className="text-left py-2 px-2 sm:px-4 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.slice(0, 100).map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100/60 dark:border-gray-800/60"
                      >
                        <td className="py-2 px-2 sm:px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.event_type === "profile_view"
                                ? "bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                            }`}
                          >
                            {item.event_type === "profile_view" ? "View" : "Click"}
                          </span>
                        </td>
                        <td className="py-2 px-2 sm:px-4 hidden sm:table-cell capitalize">
                          {item.platform || "Unknown"}
                        </td>
                        <td className="py-2 px-2 sm:px-4 hidden md:table-cell text-xs sm:text-sm truncate max-w-[240px]">
                          {item.referrer || "Direct"}
                        </td>
                        <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">
                          {new Date(item.timestamp).toLocaleDateString()}{" "}
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
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
