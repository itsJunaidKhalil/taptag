"use client";

import { useEffect, useState, useRef } from "react";
import SocialButton from "./SocialButton";
import Image from "next/image";
import ProfileThemeToggle from "./ProfileThemeToggle";
import { ThemeName } from "@/utils/themes";

// Import PLATFORMS for footer icons
const PLATFORMS = [
  { 
    name: "Instagram", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
  },
  { 
    name: "LinkedIn", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  },
  { 
    name: "Facebook", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  },
  { 
    name: "YouTube", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  },
  { 
    name: "TikTok", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.65 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    )
  },
  { 
    name: "Twitter", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    )
  },
  { 
    name: "GitHub", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    )
  },
  { 
    name: "Website", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    )
  },
  { 
    name: "Email", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    )
  },
  { 
    name: "Phone", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    )
  },
  { 
    name: "WhatsApp", 
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    )
  },
];

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
  const [localTheme, setLocalTheme] = useState<ThemeName>((profile.theme as ThemeName) || "default");

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

  const theme = localTheme || profile.theme || "default";
  const baseUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com";

  const handleThemeChange = (newTheme: ThemeName) => {
    setLocalTheme(newTheme);
    // Store in localStorage for persistence during session
    if (typeof window !== "undefined") {
      localStorage.setItem(`profile-theme-${profile.id}`, newTheme);
    }
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem(`profile-theme-${profile.id}`) as ThemeName | null;
      if (savedTheme) {
        setLocalTheme(savedTheme);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  // Debug: Log links to console
  useEffect(() => {
    console.log("Social links received:", links);
  }, [links]);

  return (
    <div data-theme={theme} className="min-h-screen relative" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Share Button - Top Right */}
        {profile.username && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleShare}
              className="glass p-3 sm:p-4 rounded-2xl shadow-soft-lg hover:shadow-glow transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
              style={{ 
                backgroundColor: 'var(--glass-bg)', 
                borderColor: 'var(--glass-border)',
                color: 'var(--text)'
              }}
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

            <h1 className="text-3xl sm:text-4xl font-heading font-bold mt-6 text-center" style={{ color: 'var(--text)' }}>
              {profile.full_name || profile.username || "Anonymous"}
            </h1>
            {profile.username && (
              <p className="text-base sm:text-lg mt-2 text-center font-medium" style={{ color: 'var(--text)', opacity: 0.7 }}>
                @{profile.username}
              </p>
            )}
            {profile.company && (
              <p className="text-lg sm:text-xl mt-1 text-center font-medium" style={{ color: 'var(--text)', opacity: 0.8 }}>
                {profile.company}
              </p>
            )}
            {profile.about && (
              <p className="text-center text-base sm:text-lg mt-4 max-w-md leading-relaxed" style={{ color: 'var(--text)', opacity: 0.9 }}>
                {profile.about}
              </p>
            )}
          </div>

          {/* Social Links Section */}
          <div className="mb-8">
            {loadingLinks ? (
              <div className="glass p-8 rounded-3xl text-center shadow-soft">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-4 text-sm" style={{ color: 'var(--text)', opacity: 0.7 }}>Loading links...</p>
              </div>
            ) : links && links.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-heading font-semibold mb-6 text-center sm:text-left" style={{ color: 'var(--text)' }}>
                  Connect with me
                </h2>
                {links.map((link) => (
                  <SocialButton
                    key={link.id}
                    platform={link.platform}
                    url={link.url}
                    linkId={link.id}
                    onClick={() => handleLinkClick(link.id)}
                    onShare={(url, platform) => {
                      // Track share event
                      const platformType = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? "mobile" : "desktop";
                      fetch("/api/analytics", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          profile_id: profile.id,
                          event_type: "link_share",
                          platform: platformType,
                          link_platform: platform,
                        }),
                      });
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="glass p-8 rounded-3xl text-center shadow-soft">
                <p style={{ color: 'var(--text)', opacity: 0.7 }}>No social links available yet</p>
              </div>
            )}
          </div>

          {/* Contact Info Section */}
          {(profile.phone || profile.email || profile.website) && (
            <div className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg mb-8">
              <h2 className="text-2xl font-heading font-semibold mb-6 text-center sm:text-left" style={{ color: 'var(--text)' }}>
                Contact Information
              </h2>
              <div className="space-y-4 text-base sm:text-lg">
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-all group"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <div className="w-12 h-12 glass rounded-xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform flex-shrink-0 border border-white/20">
                      <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span className="font-medium transition-colors flex-1" style={{ color: 'var(--text)' }}>
                      {profile.phone}
                    </span>
                  </a>
                )}
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-all group"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <div className="w-12 h-12 glass rounded-xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform flex-shrink-0 border border-white/20">
                      <svg className="w-6 h-6 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-medium transition-colors flex-1" style={{ color: 'var(--text)' }}>
                      {profile.email}
                    </span>
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-all group"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <div className="w-12 h-12 glass rounded-xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform flex-shrink-0 border border-white/20">
                      <svg className="w-6 h-6 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <span className="font-medium group-hover:underline transition-colors flex-1" style={{ color: 'var(--text)' }}>
                      {profile.website}
                    </span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Download VCF */}
          {profile.username && (
            <div className="text-center mb-8">
              <a
                href={`/api/vcf/${profile.username}`}
                download
                className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-primary text-white rounded-2xl hover:opacity-90 transition-all duration-300 text-base sm:text-lg font-semibold shadow-soft-lg hover:shadow-glow transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Contact Card (VCF)
              </a>
            </div>
          )}

          {/* Social Icons Footer */}
          {links && links.length > 0 && (
            <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--text)', opacity: 0.4 }}>
              <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                {links.map((link) => {
                  const platformData = PLATFORMS.find(
                    (p) => p.name.toLowerCase() === link.platform.toLowerCase()
                  );
                  
                  // Get platform-specific brand colors
                  const getPlatformColor = (platform: string) => {
                    const platformLower = platform.toLowerCase();
                    if (platformLower === 'instagram') return { bg: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', icon: '#FFFFFF' };
                    if (platformLower === 'linkedin') return { bg: '#0077B5', icon: '#FFFFFF' };
                    if (platformLower === 'facebook') return { bg: '#1877F2', icon: '#FFFFFF' };
                    if (platformLower === 'youtube') return { bg: '#FF0000', icon: '#FFFFFF' };
                    if (platformLower === 'twitter') return { bg: '#1DA1F2', icon: '#FFFFFF' };
                    if (platformLower === 'github') return { bg: '#181717', icon: '#FFFFFF' };
                    if (platformLower === 'tiktok') return { bg: '#000000', icon: '#FFFFFF' };
                    if (platformLower === 'whatsapp') return { bg: '#25D366', icon: '#FFFFFF' };
                    if (platformLower === 'email') return { bg: '#EA4335', icon: '#FFFFFF' };
                    if (platformLower === 'phone') return { bg: '#34C759', icon: '#FFFFFF' };
                    if (platformLower === 'website') return { bg: '#4285F4', icon: '#FFFFFF' };
                    return { bg: 'var(--text)', icon: 'var(--bg)' };
                  };

                  const platformColor = getPlatformColor(link.platform);
                  const icon = platformData?.icon || (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                  );
                  
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleLinkClick(link.id)}
                      className="flex items-center justify-center hover:scale-110 transition-all duration-300"
                      aria-label={link.platform}
                    >
                      <div className="w-8 h-8 flex items-center justify-center" style={{ color: platformColor.bg }}>
                        {icon}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: 'var(--text)', opacity: 0.4 }}>
            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm flex-wrap">
              <button
                className="hover:underline transition-all font-semibold"
                style={{ color: 'var(--text)' }}
                onClick={() => {
                  // Cookie preferences - placeholder
                  alert("Cookie preferences coming soon!");
                }}
              >
                Cookie Preferences
              </button>
              <span style={{ color: 'var(--text)', opacity: 0.7 }}>•</span>
              <button
                className="hover:underline transition-all font-semibold"
                style={{ color: 'var(--text)' }}
                onClick={() => {
                  // Report - placeholder
                  alert("Report feature coming soon!");
                }}
              >
                Report
              </button>
              <span style={{ color: 'var(--text)', opacity: 0.7 }}>•</span>
              <button
                className="hover:underline transition-all font-semibold"
                style={{ color: 'var(--text)' }}
                onClick={() => {
                  // Privacy - placeholder
                  window.open("/privacy", "_blank");
                }}
              >
                Privacy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Toggle - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50">
        <ProfileThemeToggle 
          currentTheme={theme as ThemeName} 
          onThemeChange={handleThemeChange}
        />
      </div>
    </div>
  );
}
