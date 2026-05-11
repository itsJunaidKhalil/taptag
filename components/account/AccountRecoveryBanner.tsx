"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Props {
  profileId: string | undefined;
  deletedAt?: string | null;
  scheduledDeletionAt?: string | null;
  onRestored?: () => void;
}

/**
 * Top banner shown when the logged-in user's profile is currently soft-
 * deleted (deleted_at is set). Surfaces the deadline and a one-click
 * restore button. Hidden when the account isn't pending deletion.
 */
export default function AccountRecoveryBanner({
  profileId,
  deletedAt,
  scheduledDeletionAt,
  onRestored,
}: Props) {
  const [restoring, setRestoring] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Hide on the very next render after a successful restore so the
  // banner doesn't flash again before the parent refetches.
  useEffect(() => {
    if (!deletedAt) setHidden(true);
  }, [deletedAt]);

  if (!profileId || !deletedAt || hidden) return null;

  const deadline = scheduledDeletionAt ? new Date(scheduledDeletionAt) : null;
  const daysLeft = deadline
    ? Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86400000))
    : null;

  const handleRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in again to restore.");
        return;
      }
      const res = await fetch("/api/account/restore", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(body.error || "Could not restore account");
        return;
      }
      toast.success("Account restored.");
      setHidden(true);
      onRestored?.();
    } catch (e: any) {
      toast.error(e?.message || "Could not restore account");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="bg-rose-50 dark:bg-rose-900/30 border-b border-rose-200 dark:border-rose-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3 flex-wrap text-sm">
        <svg
          className="w-4 h-4 text-rose-600 dark:text-rose-300 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 100 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-rose-800 dark:text-rose-100 font-medium">
          Your account is scheduled for deletion
          {daysLeft !== null ? ` in ${daysLeft} day${daysLeft === 1 ? "" : "s"}` : ""}
          {deadline ? ` (${deadline.toLocaleDateString()})` : ""}.
        </span>
        <button
          type="button"
          onClick={handleRestore}
          disabled={restoring}
          className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white transition-colors"
        >
          {restoring ? "Restoring…" : "Restore my account"}
        </button>
      </div>
    </div>
  );
}
