"use client";

import Link from "next/link";
import { ReactNode } from "react";

type Illustration = "links" | "analytics" | "generic";

interface EmptyStateProps {
  illustration?: Illustration;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
  className?: string;
  children?: ReactNode;
}

export default function EmptyState({
  illustration = "generic",
  title,
  description,
  ctaLabel,
  ctaHref,
  onCta,
  className = "",
  children,
}: EmptyStateProps) {
  const cta =
    ctaLabel && (ctaHref || onCta) ? (
      ctaHref ? (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-primary text-white font-semibold text-sm shadow-soft hover:shadow-glow hover:opacity-95 transition-all"
        >
          {ctaLabel}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <button
          type="button"
          onClick={onCta}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-primary text-white font-semibold text-sm shadow-soft hover:shadow-glow hover:opacity-95 transition-all"
        >
          {ctaLabel}
        </button>
      )
    ) : null;

  return (
    <div
      className={`glass p-8 sm:p-10 rounded-3xl text-center shadow-soft flex flex-col items-center ${className}`}
    >
      <div className="mb-5 w-full max-w-[200px]" aria-hidden>
        <Illustration name={illustration} />
      </div>
      <h3
        className="text-lg sm:text-xl font-heading font-semibold mb-2"
        style={{ color: "var(--text)" }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm sm:text-base mb-5 max-w-md leading-relaxed"
          style={{ color: "var(--text)", opacity: 0.7 }}
        >
          {description}
        </p>
      )}
      {cta}
      {children}
    </div>
  );
}

function Illustration({ name }: { name: Illustration }) {
  if (name === "links") {
    return (
      <svg viewBox="0 0 200 140" className="w-full h-auto">
        <defs>
          <linearGradient id="emp-links-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="125" rx="70" ry="6" fill="currentColor" opacity="0.08" />
        <rect
          x="30"
          y="34"
          width="140"
          height="22"
          rx="11"
          fill="url(#emp-links-g)"
          opacity="0.85"
        />
        <rect x="46" y="40" width="60" height="4" rx="2" fill="#fff" opacity="0.85" />
        <rect x="46" y="48" width="40" height="3" rx="1.5" fill="#fff" opacity="0.55" />
        <rect
          x="30"
          y="64"
          width="140"
          height="22"
          rx="11"
          fill="currentColor"
          opacity="0.12"
        />
        <rect x="46" y="70" width="50" height="4" rx="2" fill="currentColor" opacity="0.55" />
        <rect x="46" y="78" width="30" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
        <rect
          x="30"
          y="94"
          width="140"
          height="22"
          rx="11"
          fill="currentColor"
          opacity="0.08"
          strokeDasharray="4 4"
          stroke="currentColor"
          strokeOpacity="0.35"
        />
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="110"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
        />
        <line
          x1="95"
          y1="105"
          x2="105"
          y2="105"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    );
  }
  if (name === "analytics") {
    return (
      <svg viewBox="0 0 200 140" className="w-full h-auto">
        <defs>
          <linearGradient id="emp-a-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="125" rx="70" ry="6" fill="currentColor" opacity="0.08" />
        <rect x="30" y="30" width="140" height="80" rx="14" fill="currentColor" opacity="0.06" />
        <path
          d="M40 95 L70 80 L95 88 L120 60 L150 70 L170 50"
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40 95 L70 80 L95 88 L120 60 L150 70 L170 50 L170 100 L40 100 Z"
          fill="url(#emp-a-g)"
        />
        <circle cx="120" cy="60" r="3" fill="#6366f1" />
        <circle cx="170" cy="50" r="3" fill="#6366f1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 140" className="w-full h-auto">
      <ellipse cx="100" cy="125" rx="70" ry="6" fill="currentColor" opacity="0.08" />
      <circle cx="100" cy="70" r="42" fill="currentColor" opacity="0.1" />
      <path
        d="M85 70l10 10 22-22"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}
