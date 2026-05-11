"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const COOLDOWN_SECONDS = 60; // must match /api/auth/resend-verification

export default function EmailVerificationBanner() {
  const [needsVerification, setNeedsVerification] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const confirmed = (user as any).email_confirmed_at || (user as any).confirmed_at;
      if (!confirmed && user.email) {
        setNeedsVerification(true);
        setEmail(user.email);
      }
    });
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!needsVerification || dismissed) return null;

  const handleResend = async () => {
    if (sending || cooldown > 0) return;
    setSending(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in again to resend.");
        return;
      }
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 429 && body.retryAfterSeconds) {
        setCooldown(body.retryAfterSeconds);
        toast.error(`Please wait ${body.retryAfterSeconds}s before trying again.`);
        return;
      }
      if (!res.ok) {
        toast.error(body.error || "Could not resend verification email");
        return;
      }
      if (body.alreadyVerified) {
        setNeedsVerification(false);
        toast.success("Your email is already verified.");
        return;
      }
      setCooldown(body.retryAfterSeconds || COOLDOWN_SECONDS);
      toast.success("Verification email sent — check your inbox.");
    } catch (e: any) {
      toast.error(e?.message || "Could not resend verification email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3 flex-wrap text-sm">
        <svg
          className="w-4 h-4 text-amber-600 dark:text-amber-300 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495a1.75 1.75 0 013.03 0l6.28 10.875A1.75 1.75 0 0116.28 16H3.72a1.75 1.75 0 01-1.515-2.63L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-amber-800 dark:text-amber-100 font-medium">
          Verify your email{email ? ` (${email})` : ""} to unlock everything.
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={sending || cooldown > 0}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white transition-colors"
          >
            {sending
              ? "Sending…"
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend verification"}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="text-amber-700 dark:text-amber-200 hover:opacity-80"
            title="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
