"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";

const RECOVERY_DAYS = 30; // must match /api/account/delete

interface Props {
  username?: string | null;
  onScheduled?: () => void;
}

export default function DeleteAccountSection({ username, onScheduled }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Require the user to type their username (or "DELETE" if no username
  // is set) so we never trigger a destructive flow on a click slip.
  const expected = (username && username.trim().length > 0 ? username : "DELETE").toLowerCase();
  const canConfirm = confirmText.trim().toLowerCase() === expected;

  const handleConfirm = async () => {
    if (!canConfirm || deleting) return;
    setDeleting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in again.");
        return;
      }
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(body.error || "Could not delete account");
        return;
      }
      toast.success(
        `Account scheduled for deletion in ${body.recovery_days ?? RECOVERY_DAYS} days. Sign back in any time before then to restore it.`,
      );
      onScheduled?.();
      setOpen(false);
      // Sign the user out and bounce them to the home page. The
      // profile is hidden from public lookups immediately.
      await supabase.auth.signOut();
      router.push("/");
    } catch (e: any) {
      toast.error(e?.message || "Could not delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg border border-rose-200/40 dark:border-rose-900/40">
      <h2 className="text-xl sm:text-2xl font-heading font-semibold mb-2 text-rose-700 dark:text-rose-300">
        Delete account
      </h2>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 max-w-xl">
        Schedules your account for deletion. Your public profile is hidden
        immediately. You have <strong>{RECOVERY_DAYS} days</strong> to sign back in
        and restore everything; after that the data is permanently removed.
      </p>
      <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc pl-5 mb-5 space-y-1">
        <li>Profile, links, analytics, and uploads are queued for deletion.</li>
        <li>Your username is reserved during the recovery window and freed afterwards.</li>
        <li>You will be signed out immediately.</li>
      </ul>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-soft transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3"
          />
        </svg>
        Delete my account…
      </button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Delete your account?"
        description={`Type "${username || "DELETE"}" below to confirm. You'll have ${RECOVERY_DAYS} days to undo this.`}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm || deleting}
              className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 shadow-soft transition-all"
            >
              {deleting ? "Scheduling…" : "Schedule deletion"}
            </button>
          </>
        }
      >
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={username || "DELETE"}
          className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
          autoFocus
        />
      </Modal>
    </section>
  );
}
