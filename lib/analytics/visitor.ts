"use client";

import { SESSION_COOKIE, SESSION_MAX_AGE_SEC, VISITOR_COOKIE } from "./constants";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSec: number) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    `path=/`,
    `max-age=${maxAgeSec}`,
    `samesite=lax`,
    secure ? "secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

/** Persistent visitor + 30-minute session ids (analytics consent required before calling). */
export function getAnalyticsVisitorIds(): { visitor_id: string; session_id: string } {
  let visitorId = readCookie(VISITOR_COOKIE);
  if (!visitorId) {
    visitorId = randomId();
    writeCookie(VISITOR_COOKIE, visitorId, 60 * 60 * 24 * 365);
  }

  let sessionId = readCookie(SESSION_COOKIE);
  if (!sessionId) {
    sessionId = randomId();
  }
  writeCookie(SESSION_COOKIE, sessionId, SESSION_MAX_AGE_SEC);

  return { visitor_id: visitorId, session_id: sessionId };
}

const UTM_STORAGE_KEY = "taptag-utm-v1";

export function captureUtmFromUrl(): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
} {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {
      utm_source: params.get("utm_source") ?? undefined,
      utm_medium: params.get("utm_medium") ?? undefined,
      utm_campaign: params.get("utm_campaign") ?? undefined,
    };
    if (utm.utm_source || utm.utm_medium || utm.utm_campaign) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
      return utm;
    }
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as {
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
    };
  } catch {
    return {};
  }
}
