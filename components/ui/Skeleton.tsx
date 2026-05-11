"use client";

import { CSSProperties } from "react";

type Rounded = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";

// Static map — Tailwind only ships classes it can see in source, so we
// cannot interpolate `rounded-${rounded}` directly.
const ROUNDED_CLASS: Record<Rounded, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
};

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
  rounded?: Rounded;
}

export function Skeleton({ className = "", style, rounded = "xl" }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`skeleton-shimmer ${ROUNDED_CLASS[rounded]} ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard({
  className = "",
  height = 120,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <div
      className={`glass p-4 sm:p-6 rounded-3xl shadow-soft ${className}`}
      style={{ minHeight: height }}
    >
      <Skeleton className="h-3 w-24 mb-3" rounded="md" />
      <Skeleton className="h-8 w-20" rounded="md" />
    </div>
  );
}

export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: `${100 - i * 12}%` }}
          rounded="md"
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 96 }: { size?: number }) {
  return <Skeleton rounded="full" style={{ width: size, height: size }} />;
}

export function SkeletonLinkRow() {
  return (
    <div className="glass p-3 sm:p-4 rounded-2xl shadow-soft flex items-center gap-3">
      <Skeleton rounded="xl" className="w-10 h-10 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" rounded="md" />
        <Skeleton className="h-3 w-2/3" rounded="md" />
      </div>
    </div>
  );
}
