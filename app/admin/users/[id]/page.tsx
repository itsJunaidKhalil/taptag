"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { adminFetch } from "@/lib/adminFetch";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import AdminUserAnalytics from "@/components/admin/AdminUserAnalytics";

interface Detail {
  user: {
    id: string;
    email: string | null;
    created_at: string;
    last_sign_in_at: string | null;
    verified: boolean;
    provider: string | null;
    providers: string[];
  };
  profile: any | null;
  links: Array<{
    id: string;
    platform: string;
    url: string;
    title: string | null;
    order_index: number;
    is_visible: boolean;
    is_featured: boolean;
  }>;
  analyticsCount: number;
  reportsAgainst: Array<{
    id: number;
    reason: string;
    details: string | null;
    status: string;
    created_at: string;
    resolved_at: string | null;
  }>;
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "";

  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [savingRole, setSavingRole] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await adminFetch<Detail>(`/api/admin/users/${id}`);
      setDetail(d);
    } catch (e: any) {
      toast.error(e.message || "Could not load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const expected = (detail?.profile?.username || "DELETE").toLowerCase();
  const canDelete = confirmText.trim().toLowerCase() === expected;

  const handleHardDelete = async () => {
    if (!canDelete || deleting) return;
    setDeleting(true);
    try {
      await adminFetch(`/api/admin/users/${id}/hard-delete`, { method: "POST" });
      toast.success("User permanently deleted.");
      router.push("/admin/users");
    } catch (e: any) {
      toast.error(e.message || "Hard delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleRoleToggle = async () => {
    if (!detail || savingRole) return;
    const next = detail.profile?.role === "admin" ? "user" : "admin";
    setSavingRole(true);
    try {
      await adminFetch(`/api/admin/users/${id}/role`, {
        method: "POST",
        body: JSON.stringify({ role: next }),
      });
      toast.success(`Role set to ${next}.`);
      await load();
    } catch (e: any) {
      toast.error(e.message || "Could not change role");
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <AdminShell
      title={
        detail?.profile?.full_name ||
        detail?.profile?.username ||
        detail?.user.email ||
        "User"
      }
      description={detail ? `${detail.user.email} · ${id}` : "Loading…"}
      actions={
        <Link
          href="/admin/users"
          className="px-3 py-2 rounded-2xl text-sm font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          ← Back to users
        </Link>
      }
    >
      {loading || !detail ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" rounded="3xl" />
          <Skeleton className="h-40 w-full" rounded="3xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <section className="glass p-5 sm:p-6 rounded-3xl shadow-soft">
              <h2 className="text-lg font-heading font-semibold mb-3">
                Profile
              </h2>
              {detail.profile ? (
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="Username" value={detail.profile.username || "—"} />
                  <Field label="Full name" value={detail.profile.full_name || "—"} />
                  <Field label="Company" value={detail.profile.company || "—"} />
                  <Field label="Phone" value={detail.profile.phone || "—"} />
                  <Field label="Website" value={detail.profile.website || "—"} />
                  <Field
                    label="Onboarded"
                    value={
                      detail.profile.onboarding_completed_at
                        ? new Date(
                            detail.profile.onboarding_completed_at,
                          ).toLocaleString()
                        : "—"
                    }
                  />
                  <Field
                    label="Soft-deleted at"
                    value={
                      detail.profile.deleted_at
                        ? new Date(detail.profile.deleted_at).toLocaleString()
                        : "—"
                    }
                  />
                  <Field
                    label="Scheduled hard-delete"
                    value={
                      detail.profile.scheduled_deletion_at
                        ? new Date(
                            detail.profile.scheduled_deletion_at,
                          ).toLocaleString()
                        : "—"
                    }
                  />
                </dl>
              ) : (
                <p className="text-sm text-gray-500">
                  This user has no profile row yet (likely hasn&apos;t finished sign-up).
                </p>
              )}
              {detail.profile?.username && (
                <Link
                  href={`/${detail.profile.username}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View public profile →
                </Link>
              )}
            </section>

            {detail.profile && <AdminUserAnalytics userId={id} />}

            <section className="glass p-5 sm:p-6 rounded-3xl shadow-soft">
              <h2 className="text-lg font-heading font-semibold mb-3">
                Links ({detail.links.length})
              </h2>
              {detail.links.length === 0 ? (
                <p className="text-sm text-gray-500">No links yet.</p>
              ) : (
                <ul className="space-y-2">
                  {detail.links.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-center gap-3 p-2 rounded-2xl bg-white/30 dark:bg-gray-800/30 text-sm"
                    >
                      <code className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                        {l.platform}
                      </code>
                      <span className="truncate flex-1">{l.title || l.url}</span>
                      {!l.is_visible && (
                        <span className="text-xs text-gray-500">hidden</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="glass p-5 sm:p-6 rounded-3xl shadow-soft">
              <h2 className="text-lg font-heading font-semibold mb-3">
                Reports against this user ({detail.reportsAgainst.length})
              </h2>
              {detail.reportsAgainst.length === 0 ? (
                <p className="text-sm text-gray-500">No reports filed.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {detail.reportsAgainst.map((r) => (
                    <li
                      key={r.id}
                      className="p-3 rounded-2xl bg-white/30 dark:bg-gray-800/30"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{r.reason}</span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            r.status === "open"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      {r.details && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {r.details}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(r.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <section className="glass p-5 rounded-3xl shadow-soft">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                Account
              </h2>
              <dl className="space-y-2 text-sm">
                <Field label="Email" value={detail.user.email || "—"} />
                <Field
                  label="Verified"
                  value={detail.user.verified ? "Yes" : "No"}
                />
                <Field
                  label="Provider"
                  value={detail.user.providers?.join(", ") || detail.user.provider || "email"}
                />
                <Field
                  label="Created"
                  value={new Date(detail.user.created_at).toLocaleString()}
                />
                <Field
                  label="Last sign-in"
                  value={
                    detail.user.last_sign_in_at
                      ? new Date(detail.user.last_sign_in_at).toLocaleString()
                      : "Never"
                  }
                />
                <Field
                  label="Legacy analytics rows"
                  value={detail.analyticsCount.toLocaleString()}
                />
                <Field label="Role" value={detail.profile?.role || "user"} />
              </dl>
            </section>

            <section className="glass p-5 rounded-3xl shadow-soft border border-rose-200/40 dark:border-rose-900/40">
              <h2 className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-3">
                Danger zone
              </h2>
              <button
                type="button"
                onClick={handleRoleToggle}
                disabled={savingRole}
                className="block w-full text-left px-4 py-2.5 mb-2 rounded-2xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-semibold disabled:opacity-60"
              >
                {detail.profile?.role === "admin"
                  ? "Revoke admin role"
                  : "Grant admin role"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="block w-full text-left px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold"
              >
                Hard-delete user now…
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Removes the user, profile, all links, analytics, and the auth
                row. Skips the 30-day recovery window. Cannot be undone.
              </p>
            </section>
          </div>
        </div>
      )}

      <Modal
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Hard-delete this user?"
        description={`Type "${detail?.profile?.username || "DELETE"}" to confirm. This cannot be undone.`}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(false)}
              className="px-4 py-2.5 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleHardDelete}
              disabled={!canDelete || deleting}
              className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300"
            >
              {deleting ? "Deleting…" : "Delete forever"}
            </button>
          </>
        }
      >
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={detail?.profile?.username || "DELETE"}
          className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
          autoFocus
        />
      </Modal>
    </AdminShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
        {label}
      </dt>
      <dd className="font-medium break-all">{value}</dd>
    </div>
  );
}
