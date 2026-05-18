"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/Skeleton";
import type { BreakdownRow } from "@/lib/analytics/insights";
analytics/phase4-admin
import type { FunnelStep } from "@/lib/analytics/funnel";
import AnalyticsFunnel from "@/components/analytics/AnalyticsFunnel";
import CityHeatmap from "@/components/analytics/CityHeatmap";
main

interface InsightsData {
  days: number;
  referrers: BreakdownRow[];
  utm: BreakdownRow[];
  countries: BreakdownRow[];
analytics/phase4-admin
  cities: BreakdownRow[];
  devices: BreakdownRow[];
  funnel: FunnelStep[];

  devices: BreakdownRow[];
main
}

function PanelSection({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: BreakdownRow[];
  empty: string;
}) {
  const max = rows[0]?.count ?? 1;
  return (
    <section className="glass p-4 sm:p-5 rounded-3xl shadow-soft-lg">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex items-center justify-between gap-2 text-xs mb-1">
                <span className="truncate text-gray-800 dark:text-gray-200 font-medium">
                  {r.label}
                </span>
                <span className="tabular-nums text-gray-500 shrink-0">{r.count}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200/80 dark:bg-gray-700/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                  style={{ width: `${Math.max(8, (r.count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function InsightsPanels() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const token = session.session?.access_token;
        if (!token) return;
        const res = await fetch("/api/dashboard/analytics/insights", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        setData(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
analytics/phase4-admin
      <>
        <Skeleton className="h-48 w-full mb-6" rounded="3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36" rounded="3xl" />
          ))}
        </div>
      </>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36" rounded="3xl" />
        ))}
      </div>
main
    );
  }

  if (!data) return null;

analytics/phase4-admin
  const hasTraffic =
    data.referrers.length +
      data.utm.length +
      data.countries.length +
      data.devices.length +
      data.cities.length >
    0;
  const hasFunnel = data.funnel?.some((s) => s.count > 0);

  if (!hasTraffic && !hasFunnel) return null;

  return (
    <>
      {hasFunnel && data.funnel && <AnalyticsFunnel steps={data.funnel} />}

      {hasTraffic && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-heading font-semibold mb-4">Traffic insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CityHeatmap cities={data.cities ?? []} />
            <PanelSection
              title="Top referrers"
              rows={data.referrers}
              empty="No referrer data yet."
            />
            <PanelSection title="UTM campaigns" rows={data.utm} empty="No UTM tags captured yet." />
            <PanelSection title="Countries" rows={data.countries} empty="No geo data yet." />
            <PanelSection title="Devices" rows={data.devices} empty="No device data yet." />
          </div>
        </div>
      )}
    </>

  const hasAny =
    data.referrers.length + data.utm.length + data.countries.length + data.devices.length > 0;
  if (!hasAny) return null;

  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-heading font-semibold mb-4">Traffic insights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PanelSection
          title="Top referrers"
          rows={data.referrers}
          empty="No referrer data yet."
        />
        <PanelSection title="UTM campaigns" rows={data.utm} empty="No UTM tags captured yet." />
        <PanelSection title="Countries" rows={data.countries} empty="No geo data yet." />
        <PanelSection title="Devices" rows={data.devices} empty="No device data yet." />
      </div>
    </div>
main
  );
}
