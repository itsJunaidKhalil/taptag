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
  links: SocialLink[];
}

export default function ProfilePageContent({ profile, links: initialLinks }: ProfilePageProps) {
  const [copied, setCopied] = useState(false);
  const [links, setLinks] = useState<SocialLink[]>(initialLinks || []);
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
        if (response.ok) {
          const data = await response.json();
          if (data.links && Array.isArray(data.links)) {
            // Always update with fresh data from API
            setLinks(data.links);
            linksFetchedRef.current = true;
          }
        }
      } catch (error) {
        console.error("Error fetching links:", error);
        // Only use initialLinks as fallback if we've never successfully fetched
        if (!linksFetchedRef.current && initialLinks && initialLinks.length > 0) {
          setLinks(initialLinks);
        }
      } finally {
        setLoadingLinks(false);
      }
    };

    // Fetch links immediately on mount
    fetchLinks();
    
    // Set up polling for updates (every 3 seconds for faster updates)
    const interval = setInterval(fetchLinks, 3000);

    return () => clearInterval(interval);
  }, [profile.username, initialLinks]);

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
    <div data-theme={theme} className="min-h-screen bg-[var(--bg)] text-[var(--text)] relative">
      <div className="max-w-2xl mx-auto">
        {/* Share Button - Top Right */}
        {profile.username && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleShare}
              className="p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              title="Share profile"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied && <span className="text-xs whitespace-nowrap hidden sm:inline">Copied!</span>}
            </button>
          </div>
        )}

        {/* Banner */}
        {profile.banner_image_url && (
          <div className="relative w-full h-40 sm:h-48 md:h-64">
            <Image
              src={profile.banner_image_url}
              alt="Banner"
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Profile Content */}
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            {profile.profile_image_url ? (
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 -mt-12 sm:-mt-16 shadow-lg">
                <Image
                  src={profile.profile_image_url}
                  alt={profile.full_name || "Profile"}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-300 dark:bg-gray-700 -mt-12 sm:-mt-16 flex items-center justify-center text-3xl sm:text-4xl shadow-lg border-4 border-white dark:border-gray-800">
                {profile.full_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold mt-4 text-center">
              {profile.full_name || profile.username || "Anonymous"}
            </h1>
            {profile.company && (
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-1 text-center">
                {profile.company}
              </p>
            )}
            {profile.about && (
              <p className="text-center text-sm sm:text-base text-gray-700 dark:text-gray-300 mt-4 max-w-md">
                {profile.about}
              </p>
            )}
          </div>

          {/* Social Links Section */}
          <div className="mb-6">
            {loadingLinks ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                Loading links...
              </div>
            ) : links && links.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 text-center sm:text-left">
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
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                No social links available yet
              </div>
            )}
          </div>

          {/* Contact Info Section */}
          {(profile.phone || profile.email || profile.website) && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center sm:text-left">
                Contact Information
              </h2>
              <div className="space-y-3 text-sm sm:text-base">
                {profile.phone && (
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <span className="text-2xl">📞</span>
                    <a
                      href={`tel:${profile.phone}`}
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {profile.phone}
                    </a>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <span className="text-2xl">✉️</span>
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <span className="text-2xl">🌐</span>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Download VCF */}
          {profile.username && (
            <div className="mt-8 text-center">
              <a
                href={`/api/vcf/${profile.username}`}
                download
                className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium shadow-md hover:shadow-lg"
              >
                📥 Download Contact Card (VCF)
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
