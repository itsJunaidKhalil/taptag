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
      className="fixed bottom-0 inset-x-0 z-[100] pointer-events-none"
    >
      <div className="pointer-events-auto border-t border-gray-200/90 dark:border-gray-700/90 bg-white/98 dark:bg-gray-950/98 backdrop-blur-lg shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.35)] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-1 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div className="min-w-0 flex-1">
              <p
                id="cookie-banner-title"
                className="font-heading font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg"
              >
                We use cookies
              </p>
              <p
                id="cookie-banner-desc"
                className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed"
              >
                Essential cookies keep TapTag working. With your permission we also use anonymous
                stats for profile owners.{" "}
                <Link
                  href="/privacy"
                  className="text-primary-600 dark:text-primary-400 underline underline-offset-2 font-medium"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>

            <div className="flex flex-row gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => choose(consentEssentialAndAnalytics)}
                className="flex-1 sm:flex-none sm:min-w-[10rem] px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all text-sm font-semibold"
              >
                Essential cookies
              </button>
              <button
                type="button"
                onClick={() => choose(consentAcceptAll)}
                className="flex-1 sm:flex-none sm:min-w-[10rem] px-4 py-3 rounded-2xl bg-gradient-primary text-white hover:opacity-90 active:scale-[0.98] transition-all text-sm font-semibold shadow-soft"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
