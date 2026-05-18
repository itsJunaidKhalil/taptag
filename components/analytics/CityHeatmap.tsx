"use client";

import type { BreakdownRow } from "@/lib/analytics/insights";

export default function CityHeatmap({ cities }: { cities: BreakdownRow[] }) {
  if (!cities.length) return null;

  const max = cities[0]?.count ?? 1;

  return (
    <section className="glass p-4 sm:p-5 rounded-3xl shadow-soft-lg">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        City heatmap
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Where profile views came from (when geo is available)
      </p>
      <ul className="space-y-2">
        {cities.map((r) => {
          const intensity = Math.max(0.15, r.count / max);
          return (
            <li
              key={r.label}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-medium"
              style={{
                backgroundColor: `rgba(99, 102, 241, ${intensity * 0.35})`,
                color: intensity > 0.5 ? "#fff" : undefined,
              }}
            >
              <span className="truncate">{r.label}</span>
              <span className="tabular-nums shrink-0">{r.count}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
