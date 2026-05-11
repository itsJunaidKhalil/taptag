"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { adminFetch } from "@/lib/adminFetch";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";

interface Report {
  id: number;
  profile_id: string | null;
  reported_username: string | null;
  reason: string;
  details: string | null;
  status: string;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_note: string | null;
  created_at: string;
}

const STATUS_TABS = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
  { value: "all", label: "All" },
] as const;

export default function AdminReportsPage() {
  const [rows, setRows] = useState<Report[]>([]);
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]["value"]>("open");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [actioning, setActioning] = useState<{
    report: Report;
    action: "resolved" | "dismissed";
  } | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const search = new URLSearchParams({
        status: tab,
        page: String(page),
        pageSize: "25",
      });
      const data = await adminFetch<{
        rows: Report[];
        totalPages: number;
        total: number;
      }>(`/api/admin/reports?${search.toString()}`);
      setRows(data.rows);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (e: any) {
      toast.error(e.message || "Could not load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  const handleAction = async () => {
    if (!actioning || saving) return;
    setSaving(true);
    try {
      await adminFetch(`/api/admin/reports/${actioning.report.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: actioning.action, note }),
      });
      toast.success(`Report ${actioning.action}.`);
      setActioning(null);
      setNote("");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Could not update report");
    } finally {
      setSaving(false);
    }
  };

  const handleReopen = async (id: number) => {
    try {
      await adminFetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "open" }),
      });
      toast.success("Report re-opened.");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Could not re-open report");
    }
  };

  return (
    <AdminShell
      title="Reports"
      description={`${total.toLocaleString()} ${tab === "all" ? "total" : tab} reports`}
    >
      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setPage(1);
              setTab(t.value);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              tab === t.value
                ? "bg-gradient-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" rounded="3xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="glass p-10 rounded-3xl text-center text-sm text-gray-500">
          No {tab === "all" ? "" : tab} reports.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="glass p-4 sm:p-5 rounded-3xl shadow-soft"
            >
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-semibold text-sm sm:text-base">
                      {r.reason}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        r.status === "open"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                          : r.status === "resolved"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {r.status}
                    </span>
                    {r.reported_username && (
                      <Link
                        href={`/${r.reported_username}`}
                        target="_blank"
                        className="text-xs underline text-primary-600 dark:text-primary-400"
                      >
                        @{r.reported_username}
                      </Link>
                    )}
                    {r.profile_id && (
                      <Link
                        href={`/admin/users/${r.profile_id}`}
                        className="text-xs underline text-gray-500"
                      >
                        view user
                      </Link>
                    )}
                  </div>
                  {r.details && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap">
                      {r.details}
                    </p>
                  )}
                  {r.resolution_note && (
                    <p className="text-xs italic text-gray-500 mt-2">
                      Note: {r.resolution_note}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Submitted {new Date(r.created_at).toLocaleString()}
                    {r.resolved_at &&
                      ` · ${r.status} ${new Date(r.resolved_at).toLocaleString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.status === "open" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setNote("");
                          setActioning({ report: r, action: "dismissed" });
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Dismiss
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNote("");
                          setActioning({ report: r, action: "resolved" });
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-primary text-white"
                      >
                        Resolve
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReopen(r.id)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Re-open
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

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

      <Modal
        open={!!actioning}
        onOpenChange={(o) => {
          if (!o) setActioning(null);
        }}
        title={
          actioning?.action === "resolved" ? "Resolve report" : "Dismiss report"
        }
        description="Optional note that will be saved alongside this action in the audit log."
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setActioning(null)}
              className="px-4 py-2.5 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAction}
              disabled={saving}
              className={`px-4 py-2.5 rounded-2xl text-sm font-semibold text-white ${
                actioning?.action === "resolved"
                  ? "bg-gradient-primary"
                  : "bg-gray-700 hover:bg-gray-800"
              } disabled:opacity-60`}
            >
              {saving
                ? "Saving…"
                : actioning?.action === "resolved"
                  ? "Resolve"
                  : "Dismiss"}
            </button>
          </>
        }
      >
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Notes (optional)"
          className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
      </Modal>
    </AdminShell>
  );
}
