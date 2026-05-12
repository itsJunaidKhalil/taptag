"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import CookieConsentModal from "@/components/ui/CookieConsentModal";
import ReportContentModal from "@/components/ui/ReportContentModal";

// Routes where the global footer should be suppressed. The admin shell
// has its own chrome, and the public profile page already exposes Privacy
// / Report / Cookie preferences inline at the bottom of the card.
const SUPPRESS_FOOTER_PREFIXES = ["/admin", "/auth/callback"];
const KNOWN_TOP_LEVEL_SEGMENTS = new Set([
  "dashboard",
  "auth",
  "admin",
  "privacy",
  "api",
  "robots.txt",
  "sitemap.xml",
]);

// `/[username]` is a single-segment catch-all. Detect it so we don't
// double up footers on public profile pages.
function isPublicProfilePage(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length !== 1) return false;
  return !KNOWN_TOP_LEVEL_SEGMENTS.has(parts[0]);
}

export default function Footer() {
  const pathname = usePathname() || "/";
  const [cookieOpen, setCookieOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  if (SUPPRESS_FOOTER_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }
  if (isPublicProfilePage(pathname)) {
    return null;
  }

  const year = new Date().getFullYear();

  return (
    <>
      <footer className="mt-16 sm:mt-20 border-t border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-heading font-bold text-base"
              >
                <span
                  className="w-7 h-7 rounded-xl text-white text-xs flex items-center justify-center shadow-soft"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary, #6366f1), var(--secondary, #8b5cf6))",
                  }}
                >
                  T
                </span>
                TapTag
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                Your digital business card. Share all your links, contact info
                and socials from one branded URL.
              </p>
            </div>

            <nav
              aria-label="Footer"
              className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
            >
              <Link
                href="/privacy"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Privacy
              </Link>
              <button
                type="button"
                onClick={() => setCookieOpen(true)}
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Cookie preferences
              </button>
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Report
              </button>
              <a
                href="mailto:privacy@taptag.biz"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Contact
              </a>
            </nav>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-200/50 dark:border-gray-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © {year} TapTag. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Made with care. Powered by Next.js + Supabase.
            </p>
          </div>
        </div>
      </footer>

      <CookieConsentModal open={cookieOpen} onOpenChange={setCookieOpen} />
      <ReportContentModal open={reportOpen} onOpenChange={setReportOpen} />
    </>
  );
}
