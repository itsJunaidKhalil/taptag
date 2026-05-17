"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import PlatformIcon from "@/components/PlatformIcon";
import { getPlatform } from "@/lib/platforms";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/Skeleton";
import type { LinkWithStats } from "@/lib/analytics/link-stats";

type DrilldownEvent = {
  id: string;
  created_at: string;
  referrer: string | null;
  device_type: string | null;
};

interface LinkDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: LinkWithStats | null;
  profileId: string;
}

function formatReferrer(referrer: string | null) {
  if (!referrer || referrer === "direct") return "Direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

export default function LinkDrilldownModal({
  open,
  onOpenChange,
  link,
  profileId,
}: LinkDrilldownModalProps) {
  const [events, setEvents] = useState<DrilldownEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !link) return;

    (async () => {
      setLoading(true);
      try {
        const sinceIso = new Date(Date.now() - 7 * 86400000).toISOString();
        const { data, error } = await supabase
          .from("analytics_events")
          .select("id, created_at, referrer, device_type")
          .eq("profile_id", profileId)
          .eq("link_id", link.id)
          .eq("event_type", "link_click")
          .gte("created_at", sinceIso)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setEvents(
          (data ?? []).map((r) => ({
            id: String(r.id),
            created_at: r.created_at,
            referrer: r.referrer,
            device_type: r.device_type,
          })),
        );
      } catch (e) {
        console.error("Link drilldown:", e);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, link, profileId]);

  if (!link) return null;

  const platform = getPlatform(link.platform);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={link.title || platform?.name || link.platform}
      description={`${link.clicksThisWeek} click${link.clicksThisWeek === 1 ? "" : "s"} in the last 7 days`}
    >
      <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
        <PlatformIcon platform={link.platform} className="w-10 h-10" />
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{link.url}</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" rounded="xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
          No clicks recorded for this link in the last 7 days.
        </p>
      ) : (
        <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {events.map((ev) => {
            const d = new Date(ev.created_at);
            return (
              <li
                key={ev.id}
                className="flex items-center justify-between gap-3 text-sm p-3 rounded-xl border border-gray-100 dark:border-gray-800"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {ev.device_type || "Unknown device"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{formatReferrer(ev.referrer)}</p>
                </div>
                <span className="text-xs text-gray-500 tabular-nums shrink-0">
                  {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}{" "}
                  {d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
