"use client";

import { useEffect, useState } from "react";
import { useEditorStore, draftToProfileCard } from "@/lib/store/editorStore";
import ProfileCard from "@/components/profile/ProfileCard";
import PhoneFrame from "@/components/profile/PhoneFrame";

/**
 * Live preview panel.
 * - Desktop (lg+): sticky right column in the edit page grid (not fixed — avoids
 *   viewport clipping and footer overlap hacks).
 * - Mobile: bottom sheet (Eye button toggles it open).
 */

/** Pixels of the global footer currently visible — shrinks sticky preview max-height. */
function useFooterClearance() {
  const [clearance, setClearance] = useState(0);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const update = () => {
      const { top } = footer.getBoundingClientRect();
      setClearance(Math.max(0, Math.ceil(window.innerHeight - top)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    ro.observe(footer);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, []);

  return clearance;
}

export default function PreviewDrawer() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const footerClearance = useFooterClearance();
  const draft = useEditorStore((s) => s.draft);
  const links = useEditorStore((s) => s.links);
  const userId = useEditorStore((s) => s.userId);
  const profile = draftToProfileCard(draft, userId);

  return (
    <>
      {/* Desktop preview column */}
      <aside
        className={`relative hidden lg:flex min-h-0 min-w-0 flex-col self-stretch transition-all duration-300 ${
          collapsed ? "w-12 shrink-0" : "w-full"
        }`}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -left-3 top-6 z-10 w-7 h-14 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-xl shadow-soft flex items-center justify-center hover:scale-105 transition-transform"
          aria-label={collapsed ? "Show preview" : "Hide preview"}
        >
          <svg
            className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {!collapsed && (
          <div
            className="sticky top-16 z-10 flex w-full min-w-0 flex-col border-l border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-soft-lg dark:border-gray-800 dark:from-gray-900 dark:to-gray-950"
            style={{
              maxHeight: `calc(100dvh - 4rem - ${footerClearance}px)`,
              bottom: footerClearance > 0 ? footerClearance : undefined,
            }}
          >
            <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto overflow-x-hidden px-4 pb-6 pt-8 scrollbar-hide sm:px-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Live preview
              </p>
              {/* data-theme wrapper so PhoneFrame and ProfileCard share the same
                  CSS variable scope and the screen bg actually updates with theme */}
              <div
                data-theme={draft.theme || "default"}
                className="flex w-full min-w-0 max-w-[320px] justify-center"
              >
                <PhoneFrame>
                  <ProfileCard profile={profile} links={links} theme={draft.theme} compact />
                </PhoneFrame>
              </div>
              <p className="mt-4 max-w-[260px] text-center text-xs text-gray-500 dark:text-gray-400">
                Updates instantly as you edit — visitors see the full-size version.
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile floating button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-gradient-primary text-white shadow-glow flex items-center justify-center"
        aria-label="Show preview"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>

      {/* Mobile bottom sheet */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 rounded-t-3xl shadow-soft-lg px-4 pt-4 pb-8 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Live preview
              </p>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
                aria-label="Close preview"
              >
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex justify-center pb-2">
              <div data-theme={draft.theme || "default"} className="w-full max-w-[320px]">
                <PhoneFrame>
                  <ProfileCard profile={profile} links={links} theme={draft.theme} compact />
                </PhoneFrame>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
