"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/adminFetch";
import { adminDownloadCsv } from "@/lib/adminDownloadCsv";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

interface PlatformAnalytics {
  days: number;
  totals: {
    views: number;
    link_clicks: number;
    link_shares: number;
    vcf_downloads: number;
    raw_events: number;
  };
  byEventType: Record<string, number>;
  topProfiles: Array<{
    profile_id: string;
    username: string | null;
    full_name: string | null;
    views: number;
    link_clicks: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<PlatformAnalytics | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await adminFetch<PlatformAnalytics>(`/api/admin/analytics?days=${days}`);
        setData(res);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Could not load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  return (
    <AdminShell
      title="Platform analytics"
      description="Aggregate card traffic across all users (non-bot events)."
      actions={
        <>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 text-sm font-medium"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <ExportCsvButton days={days} />
        </>
      }
    >
      {loading || !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" rounded="3xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" rounded="3xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <MetricCard label="Profile views" value={data.totals.views} />
            <MetricCard label="Link clicks" value={data.totals.link_clicks} />
            <MetricCard label="Shares" value={data.totals.link_shares} />
            <MetricCard label="VCF downloads" value={data.totals.vcf_downloads} />
            <MetricCard label="Raw events" value={data.totals.raw_events} hint="Ingested rows" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <section className="glass p-5 rounded-3xl shadow-soft">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                Events by type
              </h2>
              {Object.keys(data.byEventType).length === 0 ? (
                <p className="text-sm text-gray-500">No events in this window.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {Object.entries(data.byEventType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => (
                      <li key={type} className="flex justify-between gap-2">
                        <code className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                          {type}
                        </code>
                        <span className="font-semibold tabular-nums">{count.toLocaleString()}</span>
                      </li>
                    ))}
                </ul>
              )}
            </section>

            <section className="glass p-5 rounded-3xl shadow-soft">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                Top profiles by views
              </h2>
              {data.topProfiles.length === 0 ? (
                <p className="text-sm text-gray-500">No rollup data yet.</p>
              ) : (
                <ul className="divide-y divide-gray-200/40 dark:divide-gray-700/40">
                  {data.topProfiles.map((p) => (
                    <li key={p.profile_id} className="py-2.5 flex items-center gap-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/users/${p.profile_id}`}
                          className="font-semibold hover:underline truncate block"
                        >
                          {p.full_name || p.username || p.profile_id.slice(0, 8)}
                        </Link>
                        {p.username && (
                          <p className="text-xs text-gray-500">@{p.username}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 tabular-nums shrink-0">
                        {p.views} views · {p.link_clicks} clicks
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </AdminShell>
  );
}

function ExportCsvButton({ days }: { days: number }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await adminDownloadCsv(`/api/admin/analytics/export?days=${days}`, `platform-${days}d.csv`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      className="px-3 py-2 rounded-2xl text-sm font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
    >
      {exporting ? "Exporting…" : "Export CSV"}
    </button>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="glass p-4 rounded-3xl shadow-soft">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-heading font-bold tabular-nums">{value.toLocaleString()}</p>
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}
