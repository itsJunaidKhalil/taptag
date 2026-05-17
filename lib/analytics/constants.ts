export const ANALYTICS_EVENT_TYPES = [
  "profile_view",
  "link_click",
  "link_share",
  "vcf_download",
  "qr_scan",
  "contact_save",
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export const ANALYTICS_PLATFORMS = ["mobile", "desktop", "tablet"] as const;

/** Max events per IP per sliding minute (all event types). */
export const RATE_LIMIT_EVENTS_PER_IP_PER_MINUTE = 30;

/** One profile_view per (IP, profile) within this window. */
export const PROFILE_VIEW_DEDUPE_MS = 30 * 60 * 1000;

export const VISITOR_COOKIE = "taptag_vid";
export const SESSION_COOKIE = "taptag_sid";
export const SESSION_MAX_AGE_SEC = 30 * 60;
