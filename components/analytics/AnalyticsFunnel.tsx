"use client";

import type { FunnelStep } from "@/lib/analytics/funnel";

export default function AnalyticsFunnel({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(...steps.map((s) => s.count), 1);
  const hasActivity = steps.some((s) => s.count > 0);
  if (!hasActivity) return null;

  return (
    <section className="glass p-4 sm:p-6 rounded-3xl shadow-soft-lg mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-heading font-semibold mb-1">Conversion funnel</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
        Views → clicks → saves (last 7 days)
      </p>
      <ul className="space-y-4">
        {steps.map((step, i) => (
          <li key={step.key}>
            <div className="flex items-center justify-between gap-2 text-sm mb-1.5">
              <span className="font-medium text-gray-800 dark:text-gray-200">
                <span className="inline-flex w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-xs font-bold items-center justify-center mr-2">
                  {i + 1}
                </span>
                {step.label}
              </span>
              <span className="tabular-nums font-semibold">{step.count.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200/80 dark:bg-gray-700/80 overflow-hidden ml-8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{ width: `${Math.max(step.count > 0 ? 6 : 0, (step.count / max) * 100)}%` }}
              />
            </div>
            {step.rateFromPrevious != null && i > 0 && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 ml-8">
                {step.rateFromPrevious}% of profile views
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
