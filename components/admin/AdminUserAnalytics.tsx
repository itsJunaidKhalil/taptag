"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminFetch";
import { Skeleton } from "@/components/ui/Skeleton";

interface UserAnalytics {
  days: number;
  legacyEventCount: number;
  eventsTotal: number;
  period: {
    views: number;
    link_clicks: number;
    link_shares: number;
    vcf_downloads: number;
  };
  byEventType: Record<string, number>;
  recentEvents: Array<{
    id: number;
    event_type: string;
    link_id: string | null;
    referrer: string | null;
    country: string | null;
    device_type: string | null;
    created_at: string;
  }>;
}

function formatReferrer(referrer: string | null) {
  if (!referrer || referrer === "direct") return "Direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.length > 32 ? `${referrer.slice(0, 29)}…` : referrer;
  }
}

export default function AdminUserAnalytics({ userId }: { userId: string }) {
  const [data, setData] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await adminFetch<UserAnalytics>(
          `/api/admin/users/${userId}/analytics?days=7`,
        );
        setData(res);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return <Skeleton className="h-48 w-full" rounded="3xl" />;
  }

  if (!data) {
    return (
      <section className="glass p-5 sm:p-6 rounded-3xl shadow-soft">
        <h2 className="text-lg font-heading font-semibold mb-2">Analytics</h2>
        <p className="text-sm text-gray-500">Could not load analytics for this user.</p>
      </section>
    );
  }

  return (
    <section className="glass p-5 sm:p-6 rounded-3xl shadow-soft">
      <h2 className="text-lg font-heading font-semibold mb-3">Analytics (last {data.days}d)</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <MiniStat label="Views" value={data.period.views} />
        <MiniStat label="Clicks" value={data.period.link_clicks} />
        <MiniStat label="Shares" value={data.period.link_shares} />
        <MiniStat label="VCF" value={data.period.vcf_downloads} />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        {data.eventsTotal.toLocaleString()} events in analytics_events ·{" "}
        {data.legacyEventCount.toLocaleString()} legacy rows
      </p>

      {Object.keys(data.byEventType).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(data.byEventType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <span
                key={type}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 font-medium"
              >
                {type}: {count}
              </span>
            ))}
        </div>
      )}

      {data.recentEvents.length > 0 ? (
        <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
          {data.recentEvents.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/30 dark:bg-gray-800/30 text-xs"
            >
              <code className="shrink-0 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                {e.event_type}
              </code>
              <span className="truncate text-gray-600 dark:text-gray-300">
                {formatReferrer(e.referrer)}
                {e.country ? ` · ${e.country}` : ""}
                {e.device_type ? ` · ${e.device_type}` : ""}
              </span>
              <span className="ml-auto shrink-0 text-gray-400 tabular-nums">
                {new Date(e.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No recent events.</p>
      )}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 rounded-2xl bg-white/40 dark:bg-gray-800/40">
      <p className="text-[10px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-lg font-bold tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}
