"use client";

import { getConsent } from "@/lib/consent";
import type { AnalyticsTrackEventType } from "./track-client";

let initStarted = false;

export async function initPostHogIfAllowed(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!getConsent().analytics) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || initStarted) return;
  initStarted = true;

  const { default: posthog } = await import("posthog-js");
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false,
    persistence: "localStorage+cookie",
    autocapture: false,
  });
}

export async function shutdownPostHog(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { default: posthog } = await import("posthog-js");
    posthog.opt_out_capturing();
    posthog.reset();
    initStarted = false;
  } catch {
    /* not loaded */
  }
}

export async function capturePostHogEvent(
  event: AnalyticsTrackEventType,
  properties: Record<string, unknown>,
): Promise<void> {
  if (typeof window === "undefined" || !getConsent().analytics) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  await initPostHogIfAllowed();
  const { default: posthog } = await import("posthog-js");
  const nameMap: Record<AnalyticsTrackEventType, string> = {
    profile_view: "profile_viewed",
    link_click: "link_clicked",
    link_share: "link_shared",
    vcf_download: "vcf_downloaded",
    qr_scan: "qr_scanned",
    contact_save: "contact_saved",
  };
  posthog.capture(nameMap[event] ?? event, properties);
}
