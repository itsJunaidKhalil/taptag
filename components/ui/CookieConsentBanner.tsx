"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  consentAcceptAll,
  consentEssentialAndAnalytics,
  hasConsentBeenSet,
  saveConsent,
} from "@/lib/consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasConsentBeenSet()) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const choose = (settings: typeof consentEssentialAndAnalytics) => {
    saveConsent(settings);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed bottom-0 inset-x-0 z-[100] p-4 sm:p-5 pointer-events-none"
    >
      <div className="pointer-events-auto max-w-3xl mx-auto rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg px-4 py-4 sm:px-6 sm:py-5">
        <p
          id="cookie-banner-title"
          className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base"
        >
          We use cookies
        </p>
        <p
          id="cookie-banner-desc"
          className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed"
        >
          Essential cookies keep TapTag working. With your permission we also collect anonymous
          profile statistics so card owners can see views and link clicks. See our{" "}
          <Link
            href="/privacy"
            className="text-primary-600 dark:text-primary-400 underline font-medium"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-col-reverse sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => choose(consentEssentialAndAnalytics)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-semibold text-left sm:text-center"
          >
            Essential cookies
            <span className="block text-[11px] font-normal text-gray-500 dark:text-gray-400 mt-0.5">
              Includes analytics for profile owners
            </span>
          </button>
          <button
            type="button"
            onClick={() => choose(consentAcceptAll)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-primary text-white hover:opacity-90 transition-all text-sm font-semibold shadow-soft text-left sm:text-center"
          >
            Accept all
            <span className="block text-[11px] font-normal text-white/85 mt-0.5">
              Essential, analytics &amp; marketing
            </span>
          </button>
        </div>
        </div>
    </div>
  );
}
