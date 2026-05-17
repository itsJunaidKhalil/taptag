"use client";

import { useEffect } from "react";
import { getConsent } from "@/lib/consent";
import { initPostHogIfAllowed, shutdownPostHog } from "@/lib/analytics/posthog";
import { captureUtmFromUrl } from "@/lib/analytics/visitor";

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    captureUtmFromUrl();
    if (getConsent().analytics) {
      void initPostHogIfAllowed();
    }

    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent).detail as { analytics?: boolean };
      if (detail?.analytics) {
        void initPostHogIfAllowed();
      } else {
        void shutdownPostHog();
      }
    };

    window.addEventListener("taptag-consent-changed", onConsent);
    return () => window.removeEventListener("taptag-consent-changed", onConsent);
  }, []);

  return <>{children}</>;
}
