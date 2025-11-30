"use client";

import { useEffect, useState, useRef } from "react";
import SocialButton from "./SocialButton";
import Image from "next/image";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  company: string | null;
  about: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  profile_image_url: string | null;
  banner_image_url: string | null;
  theme: string | null;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  order_index: number;
}

interface ProfilePageProps {
  profile: Profile;
}

export default function ProfilePageContent({ profile }: ProfilePageProps) {
  const [copied, setCopied] = useState(false);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const linksFetchedRef = useRef(false);

  // Fetch links dynamically to get latest updates
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        // Add cache-busting query parameter
        const timestamp = Date.now();
        const response = await fetch(`/api/profile/${profile.username}/links?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (!response.ok) return;

        const data = await response.json();
        if (data.links && Array.isArray(data.links)) {
          // Always update with fresh data from API
          setLinks(data.links);
          linksFetchedRef.current = true;
        }
      } catch (error) {
        console.error("Error fetching links:", error);
      } finally {
        setLoadingLinks(false);
      }
    };

    // Fetch links immediately on mount
    fetchLinks();
    
    // Set up polling for updates (every 3 seconds for faster updates)
    const interval = setInterval(fetchLinks, 3000);

    return () => clearInterval(interval);
  }, [profile.username]);

  useEffect(() => {
    // Track profile view
    const trackView = async () => {
      const platform = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
        ? "mobile"
        : "desktop";
      const referrer = document.referrer || "direct";

      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profile.id,
          event_type: "profile_view",
          platform,
          referrer,
        }),
      });
    };

    trackView();
  }, [profile.id]);

  const handleShare = async () => {
    const baseUrl = typeof window !== "undefined" 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com";
    const profileUrl = `${baseUrl}/${profile.username}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.full_name || profile.username}'s Digital Card`,
          text: `Check out ${profile.full_name || profile.username}'s digital business card`,
          url: profileUrl,
        });
      } catch (err) {
        // User cancelled or error occurred, fall back to copy
        navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      // Fallback to copy if Web Share API is not available
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLinkClick = async (linkId: string) => {
    const platform = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
      ? "mobile"
      : "desktop";
    const referrer = document.referrer || "direct";

    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile_id: profile.id,
        event_type: "link_click",
        platform,
        referrer,
      }),
    });
  };

  const theme = profile.theme || "default";
  const baseUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com";

  // Debug: Log links to console
  useEffect(() => {
    console.log("Social links received:", links);
  }, [links]);

  return (
    <div data-theme={theme} className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/10 text-[var(--text)] relative">
      <div className="max-w-2xl mx-auto">
        {/* Share Button - Top Right */}
        {profile.username && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleShare}
              className="glass p-3 sm:p-4 rounded-2xl shadow-soft-lg hover:shadow-glow transition-all duration-300 flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transform hover:scale-105"
              title="Share profile"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied && <span className="text-xs whitespace-nowrap hidden sm:inline font-medium">Copied!</span>}
            </button>
          </div>
        )}

        {/* Banner */}
        {profile.banner_image_url && (
          <div className="relative w-full h-48 sm:h-56 md:h-72 rounded-b-3xl overflow-hidden shadow-soft-lg">
            <Image
              src={profile.banner_image_url}
              alt="Banner"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        {/* Profile Content */}
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-8">
            {profile.profile_image_url ? (
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 -mt-16 sm:-mt-20 shadow-glow">
                <Image
                  src={profile.profile_image_url}
                  alt={profile.full_name || "Profile"}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-primary -mt-16 sm:-mt-20 flex items-center justify-center text-4xl sm:text-5xl font-heading font-bold text-white shadow-glow border-4 border-white dark:border-gray-900">
                {profile.full_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl font-heading font-bold mt-6 text-center text-gray-900 dark:text-white">
              {profile.full_name || profile.username || "Anonymous"}
            </h1>
            {profile.company && (
              <p className="text-lg sm:text-xl text-primary-600 dark:text-primary-400 mt-2 text-center font-medium">
                {profile.company}
              </p>
            )}
            {profile.about && (
              <p className="text-center text-base sm:text-lg text-gray-700 dark:text-gray-300 mt-6 max-w-md leading-relaxed">
                {profile.about}
              </p>
            )}
          </div>

          {/* Social Links Section */}
          <div className="mb-8">
            {loadingLinks ? (
              <div className="glass p-8 rounded-3xl text-center shadow-soft">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">Loading links...</p>
              </div>
            ) : links && links.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold text-gray-900 dark:text-white mb-6 text-center sm:text-left">
                  Connect with me
                </h2>
                {links.map((link) => (
                  <SocialButton
                    key={link.id}
                    platform={link.platform}
                    url={link.url}
                    onClick={() => handleLinkClick(link.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="glass p-8 rounded-3xl text-center shadow-soft">
                <p className="text-gray-500 dark:text-gray-400">No social links available yet</p>
              </div>
            )}
          </div>

          {/* Contact Info Section */}
          {(profile.phone || profile.email || profile.website) && (
            <div className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg mb-8">
              <h2 className="text-2xl font-heading font-semibold text-gray-900 dark:text-white mb-6 text-center sm:text-left">
                Contact Information
              </h2>
              <div className="space-y-4 text-base sm:text-lg">
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center gap-4 justify-center sm:justify-start p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-all group"
                  >
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                      <span className="text-2xl">📞</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors font-medium">
                      {profile.phone}
                    </span>
                  </a>
                )}
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-4 justify-center sm:justify-start p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-all group"
                  >
                    <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                      <span className="text-2xl">✉️</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors font-medium">
                      {profile.email}
                    </span>
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 justify-center sm:justify-start p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-all group"
                  >
                    <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🌐</span>
                    </div>
                    <span className="text-primary-600 dark:text-primary-400 group-hover:underline font-medium">
                      {profile.website}
                    </span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Download VCF */}
          {profile.username && (
            <div className="text-center">
              <a
                href={`/api/vcf/${profile.username}`}
                download
                className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-primary text-white rounded-2xl hover:opacity-90 transition-all duration-300 text-base sm:text-lg font-semibold shadow-soft-lg hover:shadow-glow transform hover:scale-105"
              >
                <span className="text-xl">📥</span>
                Download Contact Card (VCF)
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
