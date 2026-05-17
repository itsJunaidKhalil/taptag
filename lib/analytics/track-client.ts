import { getConsent } from "@/lib/consent";
import { capturePostHogEvent } from "@/lib/analytics/posthog";
import { captureUtmFromUrl, getAnalyticsVisitorIds } from "@/lib/analytics/visitor";
import type { AnalyticsEventType } from "@/lib/analytics/constants";

export type AnalyticsTrackEventType = AnalyticsEventType;

export function detectAnalyticsPlatform(): "mobile" | "desktop" | "tablet" {
  if (typeof navigator === "undefined") return "desktop";
  if (/iPad|Tablet/i.test(navigator.userAgent)) return "tablet";
  return /Mobile|Android|iPhone|iPod/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

export function trackAnalyticsEvent(payload: {
  profile_id: string;
  event_type: AnalyticsTrackEventType;
  link_id?: string;
  platform?: "mobile" | "desktop" | "tablet";
  referrer?: string;
}): void {
  if (typeof window === "undefined") return;
  if (!getConsent().analytics) return;

  const { visitor_id, session_id } = getAnalyticsVisitorIds();
  const utm = captureUtmFromUrl();

  const body = {
    profile_id: payload.profile_id,
    event_type: payload.event_type,
    link_id: payload.link_id,
    platform: payload.platform ?? detectAnalyticsPlatform(),
    referrer: payload.referrer ?? (document.referrer || "direct"),
    session_id,
    visitor_id,
    ...utm,
  };

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});

  void capturePostHogEvent(payload.event_type, {
    profile_id: payload.profile_id,
    link_id: payload.link_id,
    platform: body.platform,
  });
}
