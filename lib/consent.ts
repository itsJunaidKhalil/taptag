"use client";

export interface ConsentSettings {
  essential: true;
  analytics: boolean;
  marketing: boolean;
}

export const defaultConsent: ConsentSettings = {
  essential: true,
  analytics: false,
  marketing: false,
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
  if (typeof window === "undefined") return true;
  return !!window.localStorage.getItem(STORAGE_KEY);
}
