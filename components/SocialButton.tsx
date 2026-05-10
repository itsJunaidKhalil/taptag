"use client";

import { useState } from "react";
import { getPlatform } from "@/lib/platforms";
import PlatformIcon from "./PlatformIcon";

interface SocialButtonProps {
  platform: string;
  url: string;
  onClick?: () => void;
  linkId?: string;
  onShare?: (url: string, platform: string) => void;
  title?: string | null;
}

export default function SocialButton({ platform, url, onClick, onShare, title }: SocialButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const p = getPlatform(platform);
  const label = title || p.name;

  const handleLinkClick = () => {
    onClick?.();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);

    if (navigator.share) {
      try {
        await navigator.share({
          title: label,
          text: `Check out my ${label}`,
          url,
        });
        onShare?.(url, platform);
      } catch {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShare?.(url, platform);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setShowMenu(false);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex items-center gap-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleLinkClick}
        className="flex-1 px-4 py-3 glass border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:border-primary-500/50 dark:hover:border-primary-400/50 transition-all duration-300 hover:shadow-glow hover:scale-[1.02] flex items-center gap-3 group"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-soft group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0"
          style={{
            background: p.brandGradient || p.brandColor,
            color: p.textColor === "white" ? "#fff" : "#000",
          }}
        >
          <PlatformIcon platform={platform} className="w-5 h-5" />
        </div>
        <span className="font-heading font-semibold text-base flex-1" style={{ color: "var(--text)" }}>
          {label}
        </span>
      </a>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="menu-button flex-shrink-0 p-2 rounded-lg transition-colors"
        style={{ color: "var(--text)", opacity: 0.6 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
        aria-label="More options"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 glass rounded-2xl shadow-soft-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden min-w-[160px]">
            <button
              onClick={handleShare}
              className="w-full px-4 py-3 text-left hover:bg-white/20 dark:hover:bg-white/10 transition-colors flex items-center gap-3 text-sm font-medium"
              style={{ color: "var(--text)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share Link
            </button>
            <button
              onClick={handleCopy}
              className="w-full px-4 py-3 text-left hover:bg-white/20 dark:hover:bg-white/10 transition-colors flex items-center gap-3 text-sm font-medium"
              style={{ color: "var(--text)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
