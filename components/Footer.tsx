"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import CookieConsentModal from "@/components/ui/CookieConsentModal";
import ReportContentModal from "@/components/ui/ReportContentModal";
import TapTagLogo from "@/components/TapTagLogo";

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
  const isCardEditor = pathname.startsWith("/dashboard/edit");

  // Editor route: inset footer content from the fixed preview column only.
  // Do not raise z-index here — that painted the full-width footer over the
  // preview and clipped the phone mockup horizontally.
  const footerSurface = isCardEditor
    ? "lg:pr-[400px] bg-white/95 dark:bg-gray-950/95"
    : "bg-white/60 dark:bg-gray-900/60";

  return (
    <>
      <footer
        id="site-footer"
        className={`mt-16 sm:mt-20 border-t border-gray-200/60 dark:border-gray-800/60 backdrop-blur-sm ${footerSurface}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Layout swaps from centered-stack on mobile to two-column on
              tablets+ so the brand block and link nav sit side-by-side at
              larger sizes. */}
          <div className="flex flex-col items-center text-center gap-5 sm:flex-row sm:items-start sm:justify-between sm:text-left sm:gap-6">
            <div className="flex flex-col items-center sm:items-start">
              <TapTagLogo href="/" variant="default" size="md" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                Your digital business card. Share all your links, contact info
                and socials from one branded URL.
              </p>
            </div>

            <nav
              aria-label="Footer"
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm sm:justify-end"
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

          <div className="mt-6 pt-5 border-t border-gray-200/50 dark:border-gray-800/50 flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left sm:gap-3">
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
