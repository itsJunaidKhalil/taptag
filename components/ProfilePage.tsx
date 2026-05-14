"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import SocialButton from "./SocialButton";
import Image from "next/image";
import ProfileThemeToggle from "./ProfileThemeToggle";
import QRCode from "./QRCode";
import { ThemeName } from "@/utils/themes";
import { supabase } from "@/lib/supabase";
import { getPlatform } from "@/lib/platforms";
import PlatformIcon from "./PlatformIcon";
import CookieConsentModal from "./ui/CookieConsentModal";
import ReportModal from "./ui/ReportModal";
import EmptyState from "./ui/EmptyState";
import { SkeletonLinkRow } from "./ui/Skeleton";
import { getConsent } from "@/lib/consent";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { publicContactEmail } from "@/lib/publicContact";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  company: string | null;
  about: string | null;
  phone: string | null;
  email: string | null;
  contact_email?: string | null;
  website: string | null;
  profile_image_url: string | null;
  banner_image_url: string | null;
  company_logo_url?: string | null;
  theme: string | null;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  order_index: number;
  title?: string | null;
}

interface ProfilePageProps {
  profile: Profile;
}

export default function ProfilePageContent({ profile }: ProfilePageProps) {
  const displayContact = publicContactEmail(profile);
  const [copied, setCopied] = useState(false);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const linksFetchedRef = useRef(false);
  const trackedViewRef = useRef(false);
  const [localTheme, setLocalTheme] = useState<ThemeName>((profile.theme as ThemeName) || "default");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(true);
  const [reorderMode, setReorderMode] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [cookieOpen, setCookieOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [themeToggleVisible, setThemeToggleVisible] = useState(true);

  const isOwner = !!userId && userId === profile.id;

  const fetchLinks = useCallback(async () => {
    try {
      const timestamp = Date.now();
      const response = await fetch(`/api/profile/${profile.username}/links?t=${timestamp}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.links && Array.isArray(data.links)) {
        setLinks(data.links);
        linksFetchedRef.current = true;
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    } finally {
      setLoadingLinks(false);
    }
  }, [profile.username]);

  useEffect(() => {
    fetchLinks();
    // Pause polling while the owner is reordering to avoid races
    // between optimistic local state and the periodic refetch.
    if (reorderMode) return;
    const interval = setInterval(fetchLinks, 3000);
    return () => clearInterval(interval);
  }, [fetchLinks, reorderMode]);

  useEffect(() => {
    if (trackedViewRef.current) return;
    trackedViewRef.current = true;

    const consent = getConsent();
    if (!consent.analytics) return;

    const platform = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? "mobile" : "desktop";
    const referrer = document.referrer || "direct";

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile_id: profile.id,
        event_type: "profile_view",
        platform,
        referrer,
      }),
    }).catch(() => {});
  }, [profile.id]);

  const handleShare = async () => {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "https://taptag.biz";
    const profileUrl = `${baseUrl}/${profile.username}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.full_name || profile.username}'s Digital Card`,
          text: `Check out ${profile.full_name || profile.username}'s digital business card`,
          url: profileUrl,
        });
      } catch {
        navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLinkClick = async (linkId: string) => {
    const consent = getConsent();
    if (!consent.analytics) return;

    const platform = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? "mobile" : "desktop";
    const referrer = document.referrer || "direct";

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile_id: profile.id,
        event_type: "link_click",
        platform,
        referrer,
      }),
    }).catch(() => {});
  };

  const theme = localTheme || profile.theme || "default";
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://taptag.biz";

  const handleThemeChange = (newTheme: ThemeName) => {
    setLocalTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem(`profile-theme-${profile.id}`, newTheme);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem(`profile-theme-${profile.id}`) as ThemeName | null;
      if (savedTheme) {
        setLocalTheme(savedTheme);
      } else if (!profile.theme) {
        // honor prefers-color-scheme on first visit if no theme is set
        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
        if (prefersDark) setLocalTheme("dark");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      setUserId(user?.id || null);
    });
  }, []);

  // Auto-hide the floating theme toggle when scrolling down on mobile so it
  // doesn't overlap content. Re-show when scrolling up or near the top/bottom.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const nearTop = y < 80;
        const nearBottom = y + window.innerHeight > document.body.scrollHeight - 80;
        if (nearTop || nearBottom) {
          setThemeToggleVisible(true);
        } else if (y > lastY + 6) {
          setThemeToggleVisible(false);
        } else if (y < lastY - 6) {
          setThemeToggleVisible(true);
        }
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---- Drag-and-drop reorder (only available to the profile owner) ----
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleReorderEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(links, oldIndex, newIndex).map((l, i) => ({
      ...l,
      order_index: i,
    }));
    setLinks(reordered);
    setSavingOrder(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to reorder");
        return;
      }
      const res = await fetch("/api/social/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ orderedIds: reordered.map((l) => l.id) }),
      });
      const r = await res.json().catch(() => ({}));
      if (!res.ok || r.error) throw new Error(r.error || "Could not save order");
    } catch (e: any) {
      toast.error(e.message || "Could not save order");
      fetchLinks(); // revert local state to DB truth
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div
      data-theme={theme}
      className="min-h-screen relative"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <nav className="fixed top-0 left-0 right-0 z-50 px-3 pt-4 pb-2.5 sm:px-4 sm:pt-5">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-3xl shadow-soft-lg px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border gap-2"
            style={{
              backgroundColor: "var(--glass-bg, rgba(255,255,255,0.85))",
              borderColor: "var(--glass-border, rgba(255,255,255,0.3))",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 sm:gap-2 text-sm font-semibold transition-all duration-200 group min-w-0"
                style={{ color: "var(--text)" }}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 group-hover:-translate-x-0.5 border"
                  style={{ backgroundColor: "var(--glass-bg, rgba(0,0,0,0.06))" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </div>
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>
            ) : (
              <Link href="/" className="flex items-center gap-2 min-w-0" style={{ color: "var(--text)" }}>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary, #6366f1), var(--secondary, #8b5cf6))",
                  }}
                >
                  T
                </div>
                <span className="font-heading font-bold text-sm hidden sm:inline">TapTag</span>
              </Link>
            )}

            {profile.username && (
              <span
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "var(--glass-bg, rgba(0,0,0,0.06))",
                  color: "var(--text)",
                  opacity: 0.8,
                }}
              >
                @{profile.username}
              </span>
            )}

            {profile.username && (
              <button
                onClick={handleShare}
                aria-label="Share profile"
                className="flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2 rounded-full sm:rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary, #6366f1), var(--secondary, #8b5cf6))",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
                }}
                title="Share profile"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
                <span className="sr-only sm:hidden">{copied ? "Copied" : "Share"}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto pt-20 sm:pt-24">
        {profile.banner_image_url && (
          <div className="relative w-full h-48 sm:h-56 md:h-72 rounded-b-3xl overflow-hidden shadow-soft-lg">
            <Image src={profile.banner_image_url} alt="Banner" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col items-center mb-8">
            {profile.profile_image_url ? (
              <div
                className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 shadow-glow ${
                  profile.banner_image_url ? "-mt-16 sm:-mt-20" : "mt-4"
                }`}
              >
                <Image
                  src={profile.profile_image_url}
                  alt={profile.full_name || "Profile"}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div
                className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-primary flex items-center justify-center text-4xl sm:text-5xl font-heading font-bold text-white shadow-glow border-4 border-white dark:border-gray-900 ${
                  profile.banner_image_url ? "-mt-16 sm:-mt-20" : "mt-4"
                }`}
              >
                {profile.full_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}

            <h1
              className="text-3xl sm:text-4xl font-heading font-bold mt-6 text-center"
              style={{ color: "var(--text)" }}
            >
              {profile.full_name || profile.username || "Anonymous"}
            </h1>
            {profile.username && (
              <p
                className="text-base sm:text-lg mt-2 text-center font-medium"
                style={{ color: "var(--text)", opacity: 0.7 }}
              >
                @{profile.username}
              </p>
            )}
            {profile.company && (
              <p
                className="text-lg sm:text-xl mt-1 text-center font-medium"
                style={{ color: "var(--text)", opacity: 0.8 }}
              >
                {profile.company}
              </p>
            )}
            {profile.about && (
              <p
                className="text-center text-base sm:text-lg mt-4 max-w-md leading-relaxed"
                style={{ color: "var(--text)", opacity: 0.9 }}
              >
                {profile.about}
              </p>
            )}
          </div>

          <div className="mb-8">
            {loadingLinks ? (
              <div className="space-y-3">
                <SkeletonLinkRow />
                <SkeletonLinkRow />
                <SkeletonLinkRow />
              </div>
            ) : links && links.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <h2
                    className="text-2xl font-heading font-semibold text-center sm:text-left"
                    style={{ color: "var(--text)" }}
                  >
                    Connect with me
                  </h2>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setReorderMode((v) => !v)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-[1.03] active:scale-95 border"
                      style={{
                        backgroundColor: reorderMode
                          ? "var(--primary, #6366f1)"
                          : "var(--glass-bg, rgba(0,0,0,0.06))",
                        color: reorderMode ? "#fff" : "var(--text)",
                        borderColor: "var(--glass-border, rgba(0,0,0,0.08))",
                      }}
                      title={reorderMode ? "Finish reordering" : "Drag to reorder your links"}
                    >
                      {reorderMode ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Done
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 8h16M4 16h16"
                            />
                          </svg>
                          Reorder
                        </>
                      )}
                    </button>
                  )}
                </div>
                {isOwner && reorderMode ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleReorderEnd}
                  >
                    <SortableContext
                      items={links.map((l) => l.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {links.map((link) => (
                          <SortableProfileLink key={link.id} link={link} />
                        ))}
                      </div>
                    </SortableContext>
                    {savingOrder && (
                      <p
                        className="text-xs text-center mt-3"
                        style={{ color: "var(--text)", opacity: 0.6 }}
                      >
                        Saving new order…
                      </p>
                    )}
                  </DndContext>
                ) : (
                  links.map((link) => (
                    <SocialButton
                      key={link.id}
                      platform={link.platform}
                      url={link.url}
                      linkId={link.id}
                      title={link.title}
                      onClick={() => handleLinkClick(link.id)}
                      onShare={(url, platform) => {
                        const consent = getConsent();
                        if (!consent.analytics) return;
                        const platformType = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
                          ? "mobile"
                          : "desktop";
                        fetch("/api/analytics", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            profile_id: profile.id,
                            event_type: "link_share",
                            platform: platformType,
                            link_platform: platform,
                          }),
                        }).catch(() => {});
                      }}
                    />
                  ))
                )}
              </div>
            ) : (
              <EmptyState
                illustration="links"
                title={isOwner ? "No links yet" : "Nothing here yet"}
                description={
                  isOwner
                    ? "Add your first social link or call-to-action so visitors can connect with you."
                    : `${profile.full_name || profile.username || "This user"} hasn't added any links yet. Check back soon!`
                }
                ctaLabel={isOwner ? "Add your first link" : undefined}
                ctaHref={isOwner ? "/dashboard/edit?tab=links" : undefined}
              />
            )}
          </div>

          {(profile.phone || displayContact || profile.website) && (
            <div className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg mb-8">
              <h2
                className="text-2xl font-heading font-semibold mb-6 text-center sm:text-left"
                style={{ color: "var(--text)" }}
              >
                Contact Information
              </h2>
              <div className="space-y-4 text-base sm:text-lg">
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-all group"
                  >
                    <div className="w-12 h-12 glass rounded-xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform flex-shrink-0 border border-white/20">
                      <svg
                        className="w-6 h-6 text-primary-600 dark:text-primary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <span
                      className="font-medium transition-colors flex-1"
                      style={{ color: "var(--text)" }}
                    >
                      {profile.phone}
                    </span>
                  </a>
                )}
                {displayContact && (
                  <a
                    href={`mailto:${displayContact}`}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-all group"
                  >
                    <div className="w-12 h-12 glass rounded-xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform flex-shrink-0 border border-white/20">
                      <svg
                        className="w-6 h-6 text-secondary-600 dark:text-secondary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span
                      className="font-medium transition-colors flex-1"
                      style={{ color: "var(--text)" }}
                    >
                      {displayContact}
                    </span>
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-all group"
                  >
                    <div className="w-12 h-12 glass rounded-xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform flex-shrink-0 border border-white/20">
                      <svg
                        className="w-6 h-6 text-accent-600 dark:text-accent-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                    </div>
                    <span
                      className="font-medium group-hover:underline transition-colors flex-1"
                      style={{ color: "var(--text)" }}
                    >
                      {profile.website}
                    </span>
                  </a>
                )}
              </div>
            </div>
          )}

          {profile.username && (
            <div className="space-y-6 sm:space-y-8 mb-8">
              <div className="text-center">
                <a
                  href={`/api/vcf/${profile.username}`}
                  download
                  className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-primary text-white rounded-2xl hover:opacity-90 transition-all duration-300 text-base sm:text-lg font-semibold shadow-soft-lg hover:shadow-glow transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Save to Contacts
                </a>
              </div>

              {showQr ? (
                <div className="relative glass p-6 sm:p-8 rounded-3xl shadow-soft-lg">
                  <button
                    type="button"
                    onClick={() => setShowQr(false)}
                    aria-label="Minimize QR code"
                    title="Minimize QR code"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 border"
                    style={{
                      backgroundColor: "var(--glass-bg, rgba(0,0,0,0.06))",
                      color: "var(--text)",
                      borderColor: "var(--glass-border, rgba(0,0,0,0.08))",
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <QRCode
                    url={`${baseUrl}/${profile.username}`}
                    size={180}
                    showTitle
                    showDownload
                    cardProfile={{
                      full_name: profile.full_name,
                      company: profile.company,
                      username: profile.username,
                      profile_image_url: profile.profile_image_url,
                      banner_image_url: profile.banner_image_url,
                      company_logo_url: profile.company_logo_url ?? null,
                    contact_email: profile.contact_email?.trim() || null,
                  }}
                  />
                </div>
              ) : (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowQr(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 border shadow-soft"
                    style={{
                      backgroundColor: "var(--glass-bg, rgba(255,255,255,0.85))",
                      color: "var(--text)",
                      borderColor: "var(--glass-border, rgba(0,0,0,0.08))",
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2z"
                      />
                    </svg>
                    Show QR code
                  </button>
                </div>
              )}
            </div>
          )}

          {links && links.length > 0 && (
            <div
              className="mt-8 pt-6 border-t"
              style={{ borderColor: "var(--text)", opacity: 0.4 }}
            >
              <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                {links.map((link) => {
                  const p = getPlatform(link.platform);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleLinkClick(link.id)}
                      className="flex items-center justify-center hover:scale-110 transition-all duration-300"
                      aria-label={p.name}
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center"
                        style={{ color: p.brandColor }}
                      >
                        <PlatformIcon platform={link.platform} className="w-5 h-5" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div
            className="mt-6 pt-4 border-t text-center"
            style={{ borderColor: "var(--text)", opacity: 0.4 }}
          >
            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm flex-wrap">
              <button
                className="hover:underline transition-all font-semibold"
                style={{ color: "var(--text)" }}
                onClick={() => setCookieOpen(true)}
              >
                Cookie Preferences
              </button>
              <span style={{ color: "var(--text)", opacity: 0.7 }}>•</span>
              <button
                className="hover:underline transition-all font-semibold"
                style={{ color: "var(--text)" }}
                onClick={() => setReportOpen(true)}
              >
                Report
              </button>
              <span style={{ color: "var(--text)", opacity: 0.7 }}>•</span>
              <Link
                href="/privacy"
                target="_blank"
                className="hover:underline transition-all font-semibold"
                style={{ color: "var(--text)" }}
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-4 right-4 z-50 transition-all duration-300 ease-out"
        style={{
          transform: themeToggleVisible ? "translateY(0)" : "translateY(120%)",
          opacity: themeToggleVisible ? 1 : 0,
          pointerEvents: themeToggleVisible ? "auto" : "none",
        }}
      >
        <ProfileThemeToggle currentTheme={theme as ThemeName} onThemeChange={handleThemeChange} />
      </div>

      <CookieConsentModal open={cookieOpen} onOpenChange={setCookieOpen} />
      {profile.username && (
        <ReportModal
          open={reportOpen}
          onOpenChange={setReportOpen}
          username={profile.username}
          profileId={profile.id}
        />
      )}
    </div>
  );
}

// Sortable row used only when the profile owner is actively reordering.
// Shows a visible drag handle on the left, link icon+label in the middle,
// and remains keyboard-accessible via @dnd-kit's KeyboardSensor.
function SortableProfileLink({ link }: { link: SocialLink }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });
  const p = getPlatform(link.platform);
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : "auto",
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass flex items-center gap-3 p-3 sm:p-4 rounded-2xl shadow-soft border"
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        title="Drag to reorder"
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        style={{
          backgroundColor: "var(--glass-bg, rgba(0,0,0,0.06))",
          color: "var(--text)",
        }}
        {...attributes}
        {...listeners}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 4a1 1 0 100 2 1 1 0 000-2zm0 5a1 1 0 100 2 1 1 0 000-2zm0 5a1 1 0 100 2 1 1 0 000-2zm6-10a1 1 0 100 2 1 1 0 000-2zm0 5a1 1 0 100 2 1 1 0 000-2zm0 5a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
      </button>
      <div
        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: p.brandColor, color: "#fff" }}
      >
        <PlatformIcon platform={link.platform} className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold truncate" style={{ color: "var(--text)" }}>
          {link.title || p.name}
        </p>
        <p
          className="text-xs sm:text-sm truncate"
          style={{ color: "var(--text)", opacity: 0.65 }}
        >
          {link.url}
        </p>
      </div>
    </div>
  );
}
