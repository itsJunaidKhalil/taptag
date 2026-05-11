"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch, adminFetchRaw } from "@/lib/adminFetch";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

interface UserRow {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  company: string | null;
  role: "user" | "admin";
  verified: boolean;
  onboarded: boolean;
  deleted_at: string | null;
  scheduled_deletion_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  provider: string | null;
}

const STATUSES = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "unverified", label: "Unverified" },
  { value: "deleted", label: "Soft-deleted" },
] as const;

export default function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]["value"]>("all");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Debounce search input so we don't hammer the API on every keystroke.
  const params = useMemo(
    () => ({ q, status, page, pageSize: 25 }),
    [q, status, page],
  );

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const search = new URLSearchParams({
          q: params.q,
          status: params.status,
          page: String(params.page),
          pageSize: String(params.pageSize),
        });
        const data = await adminFetch<{
          rows: UserRow[];
          totalPages: number;
          total: number;
        }>(`/api/admin/users?${search.toString()}`);
        if (cancelled) return;
        setRows(data.rows);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (e: any) {
        if (!cancelled) toast.error(e.message || "Could not load users");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [params]);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await adminFetchRaw(
        `/api/admin/users?format=csv&status=${status}&q=${encodeURIComponent(q)}`,
      );
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      const match = /filename="([^"]+)"/.exec(disposition);
      const filename = match?.[1] || `taptag-users-${Date.now()}.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminShell
      title="Users"
      description={`${total.toLocaleString()} total · click a row for details`}
      actions={
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
            />
          </svg>
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <input
          type="search"
          placeholder="Search email, username, name, company…"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          className="flex-1 px-4 py-2 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                setPage(1);
                setStatus(s.value);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                status === s.value
                  ? "bg-gradient-primary text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/60 dark:bg-gray-800/40">
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3 hidden md:table-cell">Status</th>
                <th className="px-4 py-3 hidden lg:table-cell">Role</th>
                <th className="px-4 py-3 hidden md:table-cell">Last sign-in</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t border-gray-100/60 dark:border-gray-800/60">
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-48" rounded="md" />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Skeleton className="h-4 w-20" rounded="md" />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Skeleton className="h-4 w-12" rounded="md" />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Skeleton className="h-4 w-24" rounded="md" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" rounded="md" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                    No users match the current filters.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-100/60 dark:border-gray-800/60 hover:bg-primary-50/40 dark:hover:bg-primary-900/10 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${r.id}`}
                        className="block min-w-0"
                      >
                        <p className="font-semibold truncate">
                          {r.full_name || r.username || "(no name)"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {r.email || r.id.slice(0, 8)}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <StatusBadge row={r} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          r.role === "admin"
                            ? "bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {r.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600 dark:text-gray-400">
                      {r.last_sign_in_at
                        ? new Date(r.last_sign_in_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </AdminShell>
  );
}

function StatusBadge({ row }: { row: UserRow }) {
  if (row.deleted_at) {
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
        Deleted
      </span>
    );
  }
  if (!row.verified) {
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
        Unverified
      </span>
    );
  }
  if (!row.onboarded) {
    return (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
        Onboarding
      </span>
    );
  }
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
      Active
    </span>
  );
}
