"use client";

import Image from "next/image";
import { ThemeName } from "@/utils/themes";
import { getPlatform } from "@/lib/platforms";
import PlatformIcon from "@/components/PlatformIcon";
import { publicContactEmail } from "@/lib/publicContact";

export interface ProfileCardData {
  id?: string;
  username: string | null;
  full_name: string | null;
  company: string | null;
  about: string | null;
  phone: string | null;
  email: string | null;
  /** When set, shown on the card instead of `email` (login mirror). */
  contact_email?: string | null;
  website: string | null;
  profile_image_url: string | null;
  banner_image_url: string | null;
  company_logo_url?: string | null;
  theme: string | null;
}

export interface ProfileCardLink {
  id: string;
  platform: string;
  url: string;
  order_index?: number;
  title?: string | null;
}

interface ProfileCardProps {
  profile: ProfileCardData;
  links: ProfileCardLink[];
  theme?: ThemeName;
  onLinkClick?: (linkId: string) => void;
  /** Smaller paddings + smaller initial avatar for use inside a phone frame */
  compact?: boolean;
  /** Hide outer page background — useful when embedding inside another themed surface */
  embedded?: boolean;
}

export default function ProfileCard({
  profile,
  links,
  theme,
  onLinkClick,
  compact = false,
  embedded = false,
}: ProfileCardProps) {
  const activeTheme: string = theme || profile.theme || "default";
  const displayEmail = publicContactEmail(profile);

  return (
    <div
      data-theme={activeTheme}
      className={`relative w-full min-w-0 ${compact ? "overflow-x-hidden break-words" : ""}`}
      style={
        embedded
          ? { color: "var(--text)" }
          : { backgroundColor: "var(--bg)", color: "var(--text)", minHeight: "100%" }
      }
    >
      {profile.banner_image_url ? (
        <div
          className={`relative w-full ${compact ? "h-32" : "h-44 sm:h-56 md:h-72"} overflow-hidden ${
            embedded ? "" : "rounded-b-3xl shadow-soft-lg"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.banner_image_url}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      ) : null}

      <div className={compact ? "px-4 py-4" : "px-4 sm:px-6 py-6 sm:py-8"}>
        <div className="flex flex-col items-center mb-6">
          {profile.profile_image_url ? (
            <div
              className={`relative ${
                compact ? "w-20 h-20" : "w-28 h-28 sm:w-36 sm:h-36"
              } rounded-full overflow-hidden border-4 border-white dark:border-gray-900 shadow-glow ${
                profile.banner_image_url ? "-mt-12 sm:-mt-16" : "mt-2"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.profile_image_url}
                alt={profile.full_name || "Profile"}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className={`${
                compact ? "w-20 h-20 text-3xl" : "w-28 h-28 sm:w-36 sm:h-36 text-4xl sm:text-5xl"
              } rounded-full bg-gradient-primary flex items-center justify-center font-heading font-bold text-white shadow-glow border-4 border-white dark:border-gray-900 ${
                profile.banner_image_url ? "-mt-12 sm:-mt-16" : "mt-2"
              }`}
            >
              {profile.full_name?.[0]?.toUpperCase() ||
                profile.username?.[0]?.toUpperCase() ||
                "?"}
            </div>
          )}

          <h1
            className={`${
              compact ? "text-xl break-words" : "text-3xl sm:text-4xl"
            } font-heading font-bold mt-4 text-center`}
            style={{ color: "var(--text)" }}
          >
            {profile.full_name || profile.username || "Your name"}
          </h1>
          {profile.username && (
            <p
              className={`${
                compact ? "text-xs" : "text-base sm:text-lg"
              } mt-1 text-center font-medium`}
              style={{ color: "var(--text)", opacity: 0.7 }}
            >
              @{profile.username}
            </p>
          )}
          {profile.company && (
            <p
              className={`${
                compact ? "text-sm" : "text-lg sm:text-xl"
              } mt-1 text-center font-medium`}
              style={{ color: "var(--text)", opacity: 0.8 }}
            >
              {profile.company}
            </p>
          )}
          {profile.about && (
            <p
              className={`${
                compact ? "text-xs break-words" : "text-base sm:text-lg"
              } text-center mt-3 max-w-md leading-relaxed`}
              style={{ color: "var(--text)", opacity: 0.9 }}
            >
              {profile.about}
            </p>
          )}
        </div>

        {links.length > 0 && (
          <div className="space-y-3 mb-6">
            {!compact && (
              <h2
                className="text-xl font-heading font-semibold mb-4 text-center sm:text-left"
                style={{ color: "var(--text)" }}
              >
                Connect with me
              </h2>
            )}
            {links.map((link) => {
              const p = getPlatform(link.platform);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onLinkClick?.(link.id)}
                  className={`flex min-w-0 items-center gap-3 ${
                    compact ? "px-3 py-2" : "px-4 py-3"
                  } glass border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:border-primary-500/50 transition-all hover:scale-[1.01]`}
                >
                  <div
                    className={`${
                      compact ? "w-8 h-8 rounded-lg" : "w-10 h-10 rounded-xl"
                    } flex items-center justify-center shadow-soft flex-shrink-0`}
                    style={{
                      background: p.brandGradient || p.brandColor,
                      color: p.textColor === "white" ? "#fff" : "#000",
                    }}
                  >
                    <PlatformIcon
                      platform={link.platform}
                      className={compact ? "w-4 h-4" : "w-5 h-5"}
                    />
                  </div>
                  <span
                    className={`font-heading font-semibold ${
                      compact ? "text-sm" : "text-base"
                    } flex-1 truncate`}
                    style={{ color: "var(--text)" }}
                  >
                    {link.title || p.name}
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {(profile.phone || displayEmail || profile.website) && (
          <div className={`glass ${compact ? "p-3" : "p-5 sm:p-6"} rounded-2xl shadow-soft mb-6`}>
            {!compact && (
              <h2
                className="text-lg font-heading font-semibold mb-3"
                style={{ color: "var(--text)" }}
              >
                Contact
              </h2>
            )}
            <div className="space-y-2 text-sm">
              {profile.phone && (
                <p style={{ color: "var(--text)" }} className="truncate">
                  📞 {profile.phone}
                </p>
              )}
              {displayEmail && (
                <p style={{ color: "var(--text)" }} className="truncate">
                  ✉️ {displayEmail}
                </p>
              )}
              {profile.website && (
                <p style={{ color: "var(--text)" }} className="truncate">
                  🌐 {profile.website}
                </p>
              )}
            </div>
          </div>
        )}

        {links.length > 0 && !compact && (
          <div
            className="mt-6 pt-4 border-t flex items-center justify-center gap-4 flex-wrap"
            style={{ borderColor: "var(--text)", opacity: 0.4 }}
          >
            {links.map((link) => {
              const p = getPlatform(link.platform);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onLinkClick?.(link.id)}
                  aria-label={p.name}
                >
                  <div className="w-7 h-7 flex items-center justify-center" style={{ color: p.brandColor }}>
                    <PlatformIcon platform={link.platform} className="w-5 h-5" />
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
