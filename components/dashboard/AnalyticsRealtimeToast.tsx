"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const THROTTLE_MS = 60_000;

function eventLabel(type: string): string {
  switch (type) {
    case "profile_view":
      return "Someone viewed your card";
    case "link_click":
      return "Someone clicked a link on your card";
    case "link_share":
      return "Someone shared your card";
    case "vcf_download":
      return "Someone saved your contact";
    default:
      return "New activity on your card";
  }
}

export default function AnalyticsRealtimeToast({ profileId }: { profileId: string | undefined }) {
  const lastToastRef = useRef(0);

  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel(`analytics-live-${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "analytics_events",
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          const row = payload.new as { event_type?: string; is_bot?: boolean };
          if (row.is_bot) return;
          const now = Date.now();
          if (now - lastToastRef.current < THROTTLE_MS) return;
          lastToastRef.current = now;
          toast.info(eventLabel(row.event_type || "profile_view"), {
            description: "Live from your public card",
            duration: 4000,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  return null;
}
