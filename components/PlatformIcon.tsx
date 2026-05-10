import { getPlatform } from "@/lib/platforms";

interface PlatformIconProps {
  platform: string;
  className?: string;
}

export default function PlatformIcon({ platform, className = "w-5 h-5" }: PlatformIconProps) {
  const p = getPlatform(platform);

  if (p.iconStroke) {
    return (
      <svg
        className={className}
        viewBox={p.iconViewBox || "0 0 24 24"}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={p.iconPath} />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox={p.iconViewBox || "0 0 24 24"} fill="currentColor">
      <path d={p.iconPath} />
    </svg>
  );
}

interface PlatformBadgeProps {
  platform: string;
  size?: "sm" | "md" | "lg";
}

export function PlatformBadge({ platform, size = "md" }: PlatformBadgeProps) {
  const p = getPlatform(platform);
  const sizeMap = {
    sm: { wrap: "w-8 h-8 rounded-lg", icon: "w-4 h-4" },
    md: { wrap: "w-10 h-10 rounded-xl", icon: "w-5 h-5" },
    lg: { wrap: "w-12 h-12 rounded-2xl", icon: "w-6 h-6" },
  } as const;

  return (
    <div
      className={`${sizeMap[size].wrap} flex items-center justify-center shadow-soft flex-shrink-0`}
      style={{
        background: p.brandGradient || p.brandColor,
        color: p.textColor === "white" ? "#fff" : "#000",
      }}
    >
      <PlatformIcon platform={platform} className={sizeMap[size].icon} />
    </div>
  );
}
