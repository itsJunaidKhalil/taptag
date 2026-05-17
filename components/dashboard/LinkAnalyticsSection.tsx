"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PlatformIcon from "@/components/PlatformIcon";
import { getPlatform } from "@/lib/platforms";
import { Skeleton } from "@/components/ui/Skeleton";
import type { LinkWithStats } from "@/lib/analytics/link-stats";

export default function LinkAnalyticsSection() {
  const [links, setLinks] = useState<LinkWithStats[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const token = session.session?.access_token;
        if (!token) return;

        const res = await fetch("/api/dashboard/link-analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        setLinks(json.links ?? []);
        setTotalClicks(json.totalClicksThisWeek ?? 0);
      } catch (e) {
        console.error("Link analytics:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <section className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg">
        <Skeleton className="h-6 w-40 mb-4" rounded="md" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" rounded="xl" />
          ))}
        </div>
      </section>
    );
  }

  if (links.length === 0) return null;

  const top = links.filter((l) => l.clicksThisWeek > 0).slice(0, 5);

  return (
    <section className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-semibold text-gray-900 dark:text-white">
            Link performance
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Clicks in the last 7 days
            {totalClicks > 0 && (
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {" "}
                · {totalClicks} total
              </span>
            )}
          </p>
        </div>
        <Link
          href="/dashboard/analytics"
          className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline shrink-0"
        >
          Full analytics
        </Link>
      </div>

      {top.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No link clicks yet this week. Share your card to start collecting data.
        </p>
      ) : (
        <ul className="space-y-2">
          {top.map((link) => {
            const platform = getPlatform(link.platform);
            return (
              <li
                key={link.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-900/30"
              >
                <PlatformIcon platform={link.platform} className="w-8 h-8 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {link.title || platform?.name || link.platform}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{link.url}</p>
                </div>
                <span className="text-sm font-bold tabular-nums text-primary-600 dark:text-primary-400 shrink-0">
                  {link.clicksThisWeek}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
