"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/Skeleton";

interface AnalyticsPreferencesSectionProps {
  profileId: string | undefined;
  initialShowPublicViewCount?: boolean;
}

export default function AnalyticsPreferencesSection({
  profileId,
  initialShowPublicViewCount = false,
}: AnalyticsPreferencesSectionProps) {
  const [enabled, setEnabled] = useState(initialShowPublicViewCount);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEnabled(initialShowPublicViewCount);
  }, [initialShowPublicViewCount]);

  const handleToggle = async () => {
    if (!profileId) return;
    const next = !enabled;
    setSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) {
        toast.error("Please sign in again.");
        return;
      }

      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: profileId,
          show_public_view_count: next,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not save preference");
      }

      setEnabled(next);
      toast.success(next ? "Public view count enabled" : "Public view count hidden");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  if (!profileId) {
    return (
      <section className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg">
        <Skeleton className="h-6 w-48 mb-2" rounded="md" />
        <Skeleton className="h-4 w-full" rounded="md" />
      </section>
    );
  }

  return (
    <section className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg">
      <h2 className="text-xl sm:text-2xl font-heading font-semibold mb-2 text-gray-900 dark:text-white">
        Analytics &amp; visibility
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
        Control what visitors see on your public card. Aggregate counts only — never personal
        visitor data.
      </p>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 w-4 h-4 rounded accent-indigo-600"
          checked={enabled}
          disabled={saving}
          onChange={handleToggle}
        />
        <span>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">
            Show view count on my public profile
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
            Displays &ldquo;X views this week&rdquo; on your card to encourage engagement.
          </span>
        </span>
      </label>
    </section>
  );
}
