import { getConsent } from "@/lib/consent";

export type AnalyticsTrackEventType = "profile_view" | "link_click" | "link_share";

export function detectAnalyticsPlatform(): "mobile" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  return /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? "mobile" : "desktop";
}

export function trackAnalyticsEvent(payload: {
  profile_id: string;
  event_type: AnalyticsTrackEventType;
  platform?: "mobile" | "desktop";
  referrer?: string;
}): void {
  if (typeof window === "undefined") return;
  if (!getConsent().analytics) return;

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profile_id: payload.profile_id,
      event_type: payload.event_type,
      platform: payload.platform ?? detectAnalyticsPlatform(),
      referrer: payload.referrer ?? (document.referrer || "direct"),
    }),
  }).catch(() => {});
}
