"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/adminFetch";
import Sparkline from "@/components/charts/Sparkline";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

interface Stats {
  users: {
    total: number;
    verified: number;
    active7d: number;
    active30d: number;
    signups7d: number;
    signups7dSeries: number[];
    profilesWithRow: number;
    onboarded: number;
    softDeleted: number;
  };
  reports: { open: number; resolved: number };
  revenue: { mrrCents: number; paidUsers: number; placeholder?: boolean };
  analytics: { views: number; link_clicks: number; raw_events: number };
  recent: {
    signups: Array<{
      id: string;
      username: string | null;
      full_name: string | null;
      created_at: string;
    }>;
    reports: Array<{
      id: number;
      reported_username: string | null;
      reason: string;
      status: string;
      created_at: string;
    }>;
  };
}

interface AuditRow {
  id: number;
  action: string;
  target_kind: string | null;
  target_id: string | null;
  meta: any;
  created_at: string;
  actor: { username: string | null; full_name: string | null } | null;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, a] = await Promise.all([
          adminFetch<Stats>("/api/admin/stats"),
          adminFetch<{ rows: AuditRow[] }>("/api/admin/audit-log?limit=10"),
        ]);
        setStats(s);
        setAudit(a.rows);
      } catch (e: any) {
        toast.error(e.message || "Could not load admin stats");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AdminShell
      title="Overview"
      description="Health of the platform at a glance."
    >
      {loading || !stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" rounded="3xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              label="Total users"
              value={stats.users.total}
              hint={`${stats.users.verified} verified`}
              data={stats.users.signups7dSeries}
              stroke="#6366f1"
            />
            <StatCard
              label="Active (7d)"
              value={stats.users.active7d}
              hint={`${stats.users.active30d} in 30d`}
              data={stats.users.signups7dSeries}
              stroke="#10b981"
            />
            <StatCard
              label="Signups (7d)"
              value={stats.users.signups7d}
              hint={`${stats.users.onboarded} onboarded`}
              data={stats.users.signups7dSeries}
              stroke="#8b5cf6"
            />
            <StatCard
              label="Open reports"
              value={stats.reports.open}
              hint={`${stats.reports.resolved} resolved`}
              stroke="#f59e0b"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              label="Card views (7d)"
              value={stats.analytics?.views ?? 0}
              hint="Platform-wide rollups"
              stroke="#06b6d4"
            />
            <StatCard
              label="Link clicks (7d)"
              value={stats.analytics?.link_clicks ?? 0}
              hint={`${(stats.analytics?.raw_events ?? 0).toLocaleString()} raw events`}
              stroke="#ec4899"
            />
            <Link
              href="/admin/analytics"
              className="glass p-4 sm:p-5 rounded-3xl shadow-soft flex flex-col justify-center gap-2 hover:ring-2 hover:ring-primary-400/40 transition-all"
            >
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                Full analytics
              </h3>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                Open platform dashboard →
              </p>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="glass p-5 rounded-3xl shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  MRR
                </h2>
                {stats.revenue.placeholder && (
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    Pending Stripe
                  </span>
                )}
              </div>
              <p className="text-3xl font-heading font-bold">
                ${(stats.revenue.mrrCents / 100).toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.revenue.paidUsers} paid users
              </p>
            </div>
            <div className="glass p-5 rounded-3xl shadow-soft">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Soft-deleted accounts
              </h2>
              <p className="text-3xl font-heading font-bold">
                {stats.users.softDeleted}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Awaiting hard delete after their recovery window.
              </p>
            </div>
            <div className="glass p-5 rounded-3xl shadow-soft">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Profile completion
              </h2>
              <p className="text-3xl font-heading font-bold">
                {stats.users.total === 0
                  ? 0
                  : Math.round((stats.users.onboarded / stats.users.total) * 100)}
                %
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.users.onboarded} of {stats.users.total} finished onboarding.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <RecentList
              title="Recent signups"
              empty="No recent signups."
              items={stats.recent.signups.map((s) => ({
                key: s.id,
                primary: s.full_name || s.username || s.id.slice(0, 8),
                secondary: s.username ? `@${s.username}` : "no username yet",
                meta: new Date(s.created_at).toLocaleDateString(),
                href: `/admin/users/${s.id}`,
              }))}
            />
            <RecentList
              title="Recent reports"
              empty="No reports filed yet."
              items={stats.recent.reports.map((r) => ({
                key: String(r.id),
                primary: r.reason || "(no reason)",
                secondary: r.reported_username
                  ? `@${r.reported_username}`
                  : "unknown profile",
                meta: r.status,
                href: `/admin/reports`,
              }))}
            />
          </div>

          <div className="mt-6 sm:mt-8 glass p-5 rounded-3xl shadow-soft">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              Recent admin activity
            </h2>
            {audit.length === 0 ? (
              <p className="text-sm text-gray-500">No admin actions yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200/40 dark:divide-gray-700/40">
                {audit.map((a) => (
                  <li
                    key={a.id}
                    className="py-2 text-sm flex items-center gap-3 flex-wrap"
                  >
                    <code className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                      {a.action}
                    </code>
                    <span className="text-gray-600 dark:text-gray-300">
                      by{" "}
                      <strong>
                        {a.actor?.full_name || a.actor?.username || "unknown"}
                      </strong>
                    </span>
                    {a.target_id && (
                      <Link
                        href={
                          a.target_kind === "user"
                            ? `/admin/users/${a.target_id}`
                            : "#"
                        }
                        className="text-xs underline opacity-70 hover:opacity-100"
                      >
                        {a.target_kind}:{a.target_id.slice(0, 8)}…
                      </Link>
                    )}
                    <span className="ml-auto text-xs text-gray-400">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  hint,
  data,
  stroke,
}: {
  label: string;
  value: number;
  hint?: string;
  data?: number[];
  stroke: string;
}) {
  return (
    <div className="glass p-4 sm:p-5 rounded-3xl shadow-soft flex flex-col gap-2">
      <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </h3>
      <p className="text-2xl sm:text-3xl font-heading font-bold leading-none">
        {value.toLocaleString()}
      </p>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {data && data.length > 0 && (
        <div className="-mx-1 mt-1">
          <Sparkline data={data} height={28} stroke={stroke} ariaLabel={`${label} trend`} />
        </div>
      )}
    </div>
  );
}

function RecentList({
  title,
  items,
  empty,
}: {
  title: string;
  items: {
    key: string;
    primary: string;
    secondary?: string;
    meta?: string;
    href?: string;
  }[];
  empty: string;
}) {
  return (
    <div className="glass p-5 rounded-3xl shadow-soft">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">{empty}</p>
      ) : (
        <ul className="divide-y divide-gray-200/40 dark:divide-gray-700/40">
          {items.map((it) => (
            <li key={it.key} className="py-2.5 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                {it.href ? (
                  <Link
                    href={it.href}
                    className="text-sm font-semibold hover:underline truncate block"
                  >
                    {it.primary}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold truncate">{it.primary}</p>
                )}
                {it.secondary && (
                  <p className="text-xs text-gray-500 truncate">{it.secondary}</p>
                )}
              </div>
              {it.meta && (
                <span className="text-xs text-gray-400 shrink-0">{it.meta}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
