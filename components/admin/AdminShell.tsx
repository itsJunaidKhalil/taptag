"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/Skeleton";

interface AdminShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l4-4h10l4 4M9 14h6" />
      </svg>
    ),
  },
];

export default function AdminShell({
  title,
  description,
  actions,
  children,
}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Client-side admin guard. Every /admin/* page renders this shell, so
  // this runs once per navigation. API routes also enforce the role
  // independently so this is purely a UX gate.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) router.replace("/auth/login?next=" + encodeURIComponent(pathname || "/admin"));
        return;
      }
      const res = await fetch("/api/admin/check", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      if (cancelled) return;
      if (!res.ok) {
        router.replace("/dashboard");
        return;
      }
      setAuthorized(true);
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (checking || !authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-10 w-48 mb-4" rounded="2xl" />
          <Skeleton className="h-5 w-72 mb-8" rounded="md" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-40" rounded="3xl" />
            <Skeleton className="h-40" rounded="3xl" />
            <Skeleton className="h-40" rounded="3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20">
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-heading font-bold"
          >
            <span
              className="w-7 h-7 rounded-xl text-white text-xs flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary, #6366f1), var(--secondary, #8b5cf6))",
              }}
            >
              A
            </span>
            <span className="text-base">TapTag Admin</span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {NAV.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? "bg-gradient-primary text-white shadow-glow"
                      : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  }`}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/dashboard"
              className="ml-2 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all whitespace-nowrap"
            >
              ← Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold gradient-text mb-1">
              {title}
            </h1>
            {description && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}
