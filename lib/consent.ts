"use client";

export interface ConsentSettings {
  essential: true;
  analytics: boolean;
  marketing: boolean;
}

/** Used before the visitor has chosen via the banner or preferences modal. */
export const defaultConsent: ConsentSettings = {
  essential: true,
  analytics: false,
  marketing: false,
};

/** First-visit banner: essential + analytics (no marketing). */
export const consentEssentialAndAnalytics: ConsentSettings = {
  essential: true,
  analytics: true,
  marketing: false,
};

/** First-visit banner: accept all categories. */
export const consentAcceptAll: ConsentSettings = {
  essential: true,
  analytics: true,
  marketing: true,
};

const STORAGE_KEY = "taptag-consent-v1";

export function getConsent(): ConsentSettings {
  if (typeof window === "undefined") return defaultConsent;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConsent;
    const parsed = JSON.parse(raw);
    return {
      essential: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
    };
  } catch {
    return defaultConsent;
  }
}

export function saveConsent(settings: ConsentSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("taptag-consent-changed", { detail: settings }));
}

export function hasConsentBeenSet(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.localStorage.getItem(STORAGE_KEY);
}
