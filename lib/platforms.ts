import type { ReactNode } from "react";

export type PlatformCategory =
  | "social"
  | "communication"
  | "video_music"
  | "creative"
  | "business"
  | "payment"
  | "developer"
  | "other";

export type BlockType =
  | "link"
  | "embed_video"
  | "embed_music"
  | "embed_calendar"
  | "cta"
  | "lead_capture"
  | "payment"
  | "file";

export interface Platform {
  id: string;
  name: string;
  category: PlatformCategory;
  defaultBlockType: BlockType;
  supportedBlockTypes: BlockType[];
  brandColor: string;
  brandGradient?: string;
  textColor: "white" | "black";
  iconPath: string;
  iconViewBox?: string;
  iconStroke?: boolean;
  placeholderUrl: string;
  urlHint?: string;
  validateUrl?: (url: string) => boolean;
  buildUrl?: (input: string) => string;
  /**
   * URL to open in a new tab when the user clicks "Open <Platform>" inside
   * the link form. Should land them on a page where their own profile URL
   * is easy to copy — e.g. the platform's "edit profile" or "your channel"
   * page. Omitted for platforms where this doesn't apply (email/phone/sms).
   */
  getLinkUrl?: string;
}

export const CATEGORY_LABELS: Record<PlatformCategory, string> = {
  social: "Social",
  communication: "Communication",
  video_music: "Video & Music",
  creative: "Creative",
  business: "Business",
  payment: "Payment",
  developer: "Developer",
  other: "Other",
};

export const CATEGORY_ORDER: PlatformCategory[] = [
  "social",
  "communication",
  "video_music",
  "creative",
  "business",
  "payment",
  "developer",
  "other",
];

const isHttpUrl = (url: string) => /^https?:\/\//i.test(url);

export const PLATFORMS: Platform[] = [
  {
    id: "instagram",
    name: "Instagram",
    category: "social",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#E4405F",
    brandGradient: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
    textColor: "white",
    iconPath:
      "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    placeholderUrl: "https://instagram.com/yourhandle",
    urlHint: "Or just your @handle — we'll build the link",
    buildUrl: (v) => (isHttpUrl(v) ? v : `https://instagram.com/${v.replace(/^@/, "")}`),
    getLinkUrl: "https://www.instagram.com/accounts/edit/",
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "social",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#1877F2",
    textColor: "white",
    iconPath:
      "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    placeholderUrl: "https://facebook.com/yourpage",
    getLinkUrl: "https://www.facebook.com/me",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    category: "social",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#000000",
    textColor: "white",
    iconPath:
      "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    placeholderUrl: "https://x.com/yourhandle",
    urlHint: "Or just your @handle",
    buildUrl: (v) => (isHttpUrl(v) ? v : `https://x.com/${v.replace(/^@/, "")}`),
    getLinkUrl: "https://x.com/settings/profile",
  },
  {
    id: "threads",
    name: "Threads",
    category: "social",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#000000",
    textColor: "white",
    iconPath:
      "M17.31 11.14c-.08-.04-.16-.07-.24-.11-.14-2.59-1.55-4.07-3.93-4.08h-.03c-1.42 0-2.6.61-3.33 1.71l1.31.9c.54-.82 1.39-1 2.02-1h.02c.78 0 1.37.23 1.75.67.28.32.46.77.55 1.34-.69-.12-1.43-.15-2.23-.11-2.24.13-3.68 1.44-3.59 3.26.05.92.51 1.71 1.29 2.23.66.44 1.51.65 2.39.6 1.16-.06 2.07-.5 2.71-1.31.48-.61.79-1.4.93-2.39.55.33.96.77 1.18 1.29.39.89.41 2.35-.78 3.54-1.04 1.04-2.29 1.49-4.18 1.5-2.09-.02-3.67-.69-4.7-2-.97-1.22-1.47-2.99-1.49-5.25.02-2.27.52-4.03 1.49-5.25 1.03-1.31 2.61-1.98 4.7-2 2.11.02 3.71.69 4.76 2.01.51.65.9 1.46 1.16 2.41l1.51-.4c-.31-1.17-.81-2.18-1.48-3.02-1.34-1.69-3.31-2.55-5.85-2.57h-.01c-2.54.02-4.49.89-5.79 2.58-1.16 1.51-1.76 3.61-1.78 6.24v.02c.02 2.63.62 4.74 1.78 6.24 1.3 1.69 3.25 2.56 5.79 2.57h.01c2.26-.02 3.85-.61 5.16-1.91 1.71-1.71 1.66-3.85 1.1-5.17-.4-.94-1.17-1.71-2.21-2.22zm-3.78 3.49c-.97.05-1.97-.38-2.02-1.32-.04-.7.49-1.48 2.08-1.57.18-.01.36-.02.53-.02.58 0 1.12.06 1.61.16-.18 2.27-1.25 2.7-2.2 2.75z",
    placeholderUrl: "https://threads.net/@yourhandle",
    buildUrl: (v) => (isHttpUrl(v) ? v : `https://threads.net/@${v.replace(/^@/, "")}`),
    getLinkUrl: "https://www.threads.net/",
  },
  {
    id: "tiktok",
    name: "TikTok",
    category: "social",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#000000",
    textColor: "white",
    iconPath:
      "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.65 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z",
    placeholderUrl: "https://tiktok.com/@yourhandle",
    buildUrl: (v) => (isHttpUrl(v) ? v : `https://tiktok.com/@${v.replace(/^@/, "")}`),
    getLinkUrl: "https://www.tiktok.com/setting",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    category: "social",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#FFFC00",
    textColor: "black",
    iconPath:
      "M12.16 2c2.49 0 4.69 1.37 5.85 3.43.51.91.69 2.03.78 3.13.04.49.05 1.06.05 1.59l-.01.32c.06.04.18.09.36.1.32.02.69-.06 1.07-.21.06-.02.18-.07.34-.07.13 0 .26.02.39.06.39.13.65.45.66.81.01.46-.34.86-1.04 1.18-.07.03-.16.06-.27.1-.34.13-.86.32-1 .65-.07.18-.04.4.1.69 0 .01.04.09.05.1.49 1.13 1.5 2.13 3.01 2.94.16.08.27.21.32.36.07.21 0 .43-.18.61-.71.69-2.02.94-2.55 1.04-.04.01-.08.06-.11.13-.02.06-.04.13-.06.21-.06.27-.13.55-.31.69-.18.13-.41.13-.61.13l-.18-.01c-.41-.05-.86-.09-1.4-.09-.31 0-.62.02-.94.05-.6.05-1.12.4-1.71.79-.86.58-1.84 1.23-3.32 1.23l-.13-.01c-.04.01-.08.01-.13.01-1.48 0-2.45-.65-3.32-1.23-.6-.4-1.11-.74-1.71-.79-.31-.03-.62-.05-.94-.05-.55 0-.99.07-1.4.13-.07.01-.13.01-.18.01-.27 0-.46-.07-.61-.18-.18-.13-.25-.41-.31-.69-.02-.07-.04-.16-.06-.21-.03-.07-.07-.13-.11-.13-.53-.1-1.84-.34-2.55-1.04-.18-.18-.25-.41-.18-.61.05-.16.16-.29.32-.36 1.51-.81 2.52-1.81 3.01-2.94.01-.01.05-.09.05-.1.13-.29.16-.51.1-.69-.13-.34-.65-.53-.99-.65-.11-.04-.21-.07-.27-.1-.86-.34-1.2-.81-1.06-1.27.1-.34.43-.58.81-.58.13 0 .25.03.36.07.4.18.79.27 1.13.27.21 0 .35-.04.43-.07l-.01-.34c0-.53.01-1.1.05-1.59.09-1.11.27-2.22.78-3.13C7.46 3.37 9.66 2 12.15 2z",
    placeholderUrl: "https://snapchat.com/add/yourhandle",
    getLinkUrl: "https://accounts.snapchat.com/accounts/welcome",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    category: "social",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#E60023",
    textColor: "white",
    iconPath:
      "M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.43.04-3.47.22-.94 1.4-5.94 1.4-5.94s-.36-.72-.36-1.78c0-1.66.97-2.91 2.17-2.91 1.02 0 1.51.77 1.51 1.69 0 1.03-.65 2.57-1 4-.28 1.2.6 2.18 1.79 2.18 2.15 0 3.81-2.27 3.81-5.55 0-2.9-2.08-4.93-5.06-4.93-3.45 0-5.47 2.59-5.47 5.26 0 1.04.4 2.16.9 2.77.1.11.11.21.08.33-.09.37-.29 1.2-.33 1.36-.05.22-.18.27-.41.16-1.5-.7-2.43-2.89-2.43-4.65 0-3.78 2.75-7.26 7.92-7.26 4.15 0 7.38 2.96 7.38 6.92 0 4.13-2.6 7.45-6.21 7.45-1.21 0-2.36-.63-2.74-1.38l-.75 2.85c-.27 1.04-1 2.34-1.49 3.13A12 12 0 1 0 12 0z",
    placeholderUrl: "https://pinterest.com/yourhandle",
    getLinkUrl: "https://www.pinterest.com/settings/profile/",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "social",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#0A66C2",
    textColor: "white",
    iconPath:
      "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    placeholderUrl: "https://linkedin.com/in/yourhandle",
    urlHint: "Or just your handle (e.g. john-doe)",
    buildUrl: (v) => (isHttpUrl(v) ? v : `https://linkedin.com/in/${v}`),
    getLinkUrl: "https://www.linkedin.com/in/me/",
  },

  {
    id: "whatsapp",
    name: "WhatsApp",
    category: "communication",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#25D366",
    textColor: "white",
    iconPath:
      "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
    placeholderUrl: "https://wa.me/15551234567",
    urlHint: "Phone number with country code (no + or spaces)",
    buildUrl: (v) => (isHttpUrl(v) ? v : `https://wa.me/${v.replace(/[^0-9]/g, "")}`),
  },
  {
    id: "telegram",
    name: "Telegram",
    category: "communication",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#26A5E4",
    textColor: "white",
    iconPath:
      "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
    placeholderUrl: "https://t.me/yourhandle",
    buildUrl: (v) => (isHttpUrl(v) ? v : `https://t.me/${v.replace(/^@/, "")}`),
    getLinkUrl: "https://web.telegram.org/a/#settings",
  },
  {
    id: "email",
    name: "Email",
    category: "communication",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#0EA5E9",
    textColor: "white",
    iconPath:
      "M2.5 4A1.5 1.5 0 0 0 1 5.5v.677l9.376 5.625a3 3 0 0 0 3.248 0L23 6.177V5.5A1.5 1.5 0 0 0 21.5 4zM23 7.927l-8.566 5.14a4.5 4.5 0 0 1-4.868 0L1 7.927V18.5A1.5 1.5 0 0 0 2.5 20h19a1.5 1.5 0 0 0 1.5-1.5z",
    placeholderUrl: "mailto:hello@example.com",
    urlHint: "Just type your email address",
    buildUrl: (v) => (v.startsWith("mailto:") ? v : `mailto:${v}`),
  },
  {
    id: "phone",
    name: "Phone",
    category: "communication",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#10B981",
    textColor: "white",
    iconPath:
      "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    iconStroke: true,
    placeholderUrl: "tel:+15551234567",
    urlHint: "Phone number with country code",
    buildUrl: (v) => (v.startsWith("tel:") ? v : `tel:${v.replace(/\s/g, "")}`),
  },
  {
    id: "sms",
    name: "Text Message",
    category: "communication",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#22C55E",
    textColor: "white",
    iconPath:
      "M2 6c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9.586l-3.707 3.707A1 1 0 0 1 5 20.293V17H4a2 2 0 0 1-2-2V6zm5 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
    placeholderUrl: "sms:+15551234567",
    urlHint: "Phone number to text",
    buildUrl: (v) => (v.startsWith("sms:") ? v : `sms:${v.replace(/\s/g, "")}`),
  },

  {
    id: "youtube",
    name: "YouTube",
    category: "video_music",
    defaultBlockType: "link",
    supportedBlockTypes: ["link", "embed_video"],
    brandColor: "#FF0000",
    textColor: "white",
    iconPath:
      "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    placeholderUrl: "https://youtube.com/@yourchannel",
    getLinkUrl: "https://www.youtube.com/account",
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "video_music",
    defaultBlockType: "link",
    supportedBlockTypes: ["link", "embed_music"],
    brandColor: "#1DB954",
    textColor: "white",
    iconPath:
      "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12A12 12 0 0 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
    placeholderUrl: "https://open.spotify.com/user/yourhandle",
    getLinkUrl: "https://www.spotify.com/account/profile/",
  },
  {
    id: "apple_music",
    name: "Apple Music",
    category: "video_music",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#FA243C",
    textColor: "white",
    iconPath:
      "M23.997 6.124c0-.738-.065-1.47-.24-2.19-.317-1.31-1.062-2.31-2.18-3.043C21.003.517 20.373.285 19.703.143c-.515-.115-1.026-.13-1.547-.143H5.838c-.477.013-.95.025-1.42.123-1.275.27-2.351.834-3.151 1.876-.668.873-1.026 1.866-1.16 2.978-.062.521-.107 1.043-.107 1.563.01 4.137.013 8.272.018 12.408 0 .748.066 1.485.243 2.205.32 1.314 1.07 2.32 2.193 3.052.79.516 1.426.748 2.092.89.515.114 1.025.128 1.546.142h12.318c.477-.013.95-.024 1.42-.123 1.276-.27 2.352-.833 3.152-1.876.668-.872 1.025-1.866 1.158-2.977.062-.522.107-1.043.107-1.564.012-4.137.014-8.272.018-12.408zM17.79 18.103c-.087.443-.252.832-.557 1.16-.382.41-.866.622-1.401.706-.295.046-.6.046-.91.013-.49-.066-.94-.234-1.343-.522-.585-.41-.91-.987-.967-1.706-.066-.806.255-1.477.93-1.946.405-.286.876-.443 1.387-.521.318-.05.638-.061.96-.013.245.038.476.094.7.169V8.62c0-.066.018-.13.05-.193.082-.158.21-.244.385-.244.165 0 .31.087.397.244.038.064.05.128.05.193v8.876c.013.224-.014.448-.058.667zm-.01-9.745c0-.115-.038-.21-.13-.286-.082-.064-.18-.077-.272-.026l-7.118 1.518c-.13.026-.21.13-.21.27v8.515c0 .115-.026.224-.078.32-.117.205-.32.32-.557.32-.227 0-.4-.115-.49-.32-.04-.097-.052-.205-.052-.32V9.095c0-.434.27-.75.71-.847l7.106-1.518c.347-.077.61.09.61.453v.84-.061h-.011z",
    placeholderUrl: "https://music.apple.com/profile/yourhandle",
    getLinkUrl: "https://music.apple.com/account",
  },
  {
    id: "twitch",
    name: "Twitch",
    category: "video_music",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#9146FF",
    textColor: "white",
    iconPath:
      "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z",
    placeholderUrl: "https://twitch.tv/yourchannel",
    getLinkUrl: "https://www.twitch.tv/settings/profile",
  },

  {
    id: "behance",
    name: "Behance",
    category: "creative",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#1769FF",
    textColor: "white",
    iconPath:
      "M22 7H17V5.5h5V7zM15.5 14.5c0 2.4-2 4.5-4.5 4.5H0V5h11c2.5 0 4.5 1.5 4.5 4 0 1.5-.7 2.7-2 3.4 1.5.7 2 2.4 2 4.1zm-12.5-7h6c.8 0 1.5-.7 1.5-1.5S9.8 4.5 9 4.5H3v3zm9 6.5c0-1-.7-1.5-1.5-1.5H3v3h7c.8 0 1.5-.7 1.5-1.5zm12 .5h-9c0 1.5 1.5 2.5 3 2.5 1 0 2-.5 2.5-1.5h3c-.7 2-2.7 4-5.5 4-3.5 0-6-2.5-6-6s2.4-6 6-6c3.7 0 6 2.7 6 6 0 .3 0 .7 0 1zm-3-2c0-1.4-1-2.5-3-2.5s-3 1-3 2.5h6z",
    placeholderUrl: "https://behance.net/yourhandle",
    getLinkUrl: "https://www.behance.net/settings/profile",
  },
  {
    id: "dribbble",
    name: "Dribbble",
    category: "creative",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#EA4C89",
    textColor: "white",
    iconPath:
      "M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z",
    placeholderUrl: "https://dribbble.com/yourhandle",
    getLinkUrl: "https://dribbble.com/account/profile",
  },
  {
    id: "medium",
    name: "Medium",
    category: "creative",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#000000",
    textColor: "white",
    iconPath:
      "M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z",
    placeholderUrl: "https://medium.com/@yourhandle",
    buildUrl: (v) => (isHttpUrl(v) ? v : `https://medium.com/@${v.replace(/^@/, "")}`),
    getLinkUrl: "https://medium.com/me/settings",
  },

  {
    id: "calendly",
    name: "Calendly",
    category: "business",
    defaultBlockType: "link",
    supportedBlockTypes: ["link", "embed_calendar"],
    brandColor: "#006BFF",
    textColor: "white",
    iconPath:
      "M19.655 14.262c.281.213.523.41.728.587a4.96 4.96 0 011.435 2.108c.137.396.24.83.292 1.302.025.224.04.456.04.692 0 .293-.025.587-.073.87a4.97 4.97 0 01-1.694 2.892 6.61 6.61 0 01-2.197 1.182c-1.42.477-2.94.557-4.404.547a26.31 26.31 0 01-2.79-.198 14.13 14.13 0 01-3.83-.997 11.85 11.85 0 01-3.118-2.083 11.65 11.65 0 01-2.215-2.957A11.39 11.39 0 01.296 14.45a11.27 11.27 0 010-4.892A11.41 11.41 0 011.83 5.99a11.7 11.7 0 012.215-2.953 11.83 11.83 0 013.118-2.082A14.16 14.16 0 0110.992-.044a26.91 26.91 0 012.79-.197c1.467-.012 2.987.07 4.408.547a6.62 6.62 0 012.193 1.182c.36.273.69.57.99.892.281.298.514.611.7.94.166.295.305.6.418.918.142.395.244.83.295 1.302.025.224.04.456.04.692 0 .293-.025.587-.073.87a4.95 4.95 0 01-1.692 2.892 6.62 6.62 0 01-1.412.987c-.107.052-.205.1-.295.137a8.27 8.27 0 01-.318.13c-.075.026-.125.045-.158.052a3.27 3.27 0 01-.085.022c-.075.018-.16.034-.247.044l-.05.005zM12 17.81a5.81 5.81 0 100-11.62 5.81 5.81 0 000 11.62z",
    placeholderUrl: "https://calendly.com/yourhandle",
    getLinkUrl: "https://calendly.com/event_types/user/me",
  },
  {
    id: "google_reviews",
    name: "Google Reviews",
    category: "business",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#4285F4",
    textColor: "white",
    iconPath:
      "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z",
    placeholderUrl: "https://g.page/r/your-business-id/review",
    getLinkUrl: "https://business.google.com/locations",
  },
  {
    id: "yelp",
    name: "Yelp",
    category: "business",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#D32323",
    textColor: "white",
    iconPath:
      "M20.16 12.594l-1.49-.469c-1.302-.41-2.252.984-2.252.984l-2.385 3.516c-.578.85.083 1.703.083 1.703l3.385 3.97c.523.612 1.084.234 1.084.234l3.083-3.85c1.085-1.353-.225-2.505-.225-2.505zM10.235 8.36L9.7 1.5C9.7.6 8.74 0 7.92.234L4.85.94c-.804.234-.953 1.166-.953 1.166l2.583 9.297c.395 1.42 1.625 1.117 1.625 1.117l1.4-.484c.953-.328.732-1.676.732-1.676zM7.85 14.062L4.07 14.5c-.71.082-1.04.81-1.04.81l-.385 3.39c-.082.747.65.92.65.92l3.97-.43c1.385-.15 1.224-1.354 1.224-1.354l-.115-2.467c-.04-.937-.524-.81-.524-.81zm6.27-1.733l3.685-2.36c.62-.398.398-1.275.398-1.275L16.21 5.61c-.31-.616-1.09-.39-1.09-.39l-4.155 2.69s-1.085.74-.515 1.616l1.398 2.117c.524.875 1.272.687 1.272.687z",
    placeholderUrl: "https://yelp.com/biz/your-business",
    getLinkUrl: "https://biz.yelp.com/login",
  },

  {
    id: "paypal",
    name: "PayPal",
    category: "payment",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#003087",
    textColor: "white",
    iconPath:
      "M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788l.038-.197.732-4.643.047-.255a.927.927 0 0 1 .92-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.466z",
    placeholderUrl: "https://paypal.me/yourhandle",
    getLinkUrl: "https://www.paypal.com/paypalme/grab",
  },

  {
    id: "github",
    name: "GitHub",
    category: "developer",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#181717",
    textColor: "white",
    iconPath:
      "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
    placeholderUrl: "https://github.com/yourhandle",
    buildUrl: (v) => (isHttpUrl(v) ? v : `https://github.com/${v.replace(/^@/, "")}`),
    getLinkUrl: "https://github.com/settings/profile",
  },

  {
    id: "website",
    name: "Website",
    category: "other",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#4285F4",
    textColor: "white",
    iconPath:
      "M12 2a10 10 0 100 20 10 10 0 000-20zm0 0v20M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
    iconStroke: true,
    placeholderUrl: "https://yourwebsite.com",
    buildUrl: (v) => (isHttpUrl(v) ? v : `https://${v}`),
  },
  {
    id: "custom",
    name: "Custom Link",
    category: "other",
    defaultBlockType: "link",
    supportedBlockTypes: ["link"],
    brandColor: "#6B7280",
    textColor: "white",
    iconPath:
      "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
    iconStroke: true,
    placeholderUrl: "https://example.com",
    buildUrl: (v) => (isHttpUrl(v) ? v : `https://${v}`),
  },
];

export const PLATFORM_MAP: Record<string, Platform> = PLATFORMS.reduce(
  (acc, p) => {
    acc[p.id] = p;
    acc[p.name.toLowerCase()] = p;
    return acc;
  },
  {} as Record<string, Platform>,
);

export const PLATFORMS_BY_CATEGORY: Record<PlatformCategory, Platform[]> =
  PLATFORMS.reduce(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    },
    {} as Record<PlatformCategory, Platform[]>,
  );

export function getPlatform(idOrName: string | null | undefined): Platform {
  if (!idOrName) return PLATFORM_MAP.custom;
  const key = idOrName.toLowerCase().trim();
  return PLATFORM_MAP[key] || PLATFORM_MAP.custom;
}

export function searchPlatforms(query: string): Platform[] {
  const q = query.toLowerCase().trim();
  if (!q) return PLATFORMS;
  return PLATFORMS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q),
  );
}
