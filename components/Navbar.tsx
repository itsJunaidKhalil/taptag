"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { getProfileById } from "@/lib/getProfile";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        loadProfile(user.id);
      } else {
        setLoading(false);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const profileData = await getProfileById(userId);
      setProfile(profileData);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href={user ? "/dashboard" : "/"} 
              className="text-2xl font-heading font-bold gradient-text hover:opacity-80 transition-opacity"
            >
              Digital Card
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "bg-gradient-primary text-white shadow-glow"
                      : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard/profile")
                      ? "bg-gradient-primary text-white shadow-glow"
                      : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400"
                  }`}
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/social"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard/social")
                      ? "bg-gradient-primary text-white shadow-glow"
                      : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400"
                  }`}
                >
                  Links
                </Link>
                {profile?.username && (
                  <Link
                    href={`/${profile.username}`}
                    target="_blank"
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 hover:text-secondary-600 dark:hover:text-secondary-400 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Profile
                  </Link>
                )}
                <ThemeToggle />
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 text-sm font-medium shadow-soft hover:shadow-soft-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-2 bg-gradient-primary text-white rounded-xl hover:opacity-90 transition-all duration-200 text-sm font-medium shadow-soft hover:shadow-glow"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-xl text-base font-medium transition-all ${
                    isActive("/dashboard")
                      ? "bg-gradient-primary text-white shadow-glow"
                      : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-xl text-base font-medium transition-all ${
                    isActive("/dashboard/profile")
                      ? "bg-gradient-primary text-white shadow-glow"
                      : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  }`}
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/social"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-xl text-base font-medium transition-all ${
                    isActive("/dashboard/social")
                      ? "bg-gradient-primary text-white shadow-glow"
                      : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  }`}
                >
                  Links
                </Link>
                {profile?.username && (
                  <Link
                    href={`/${profile.username}`}
                    target="_blank"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Profile
                  </Link>
                )}
                <Link
                  href="/dashboard/appearance"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-xl text-base font-medium transition-all ${
                    isActive("/dashboard/appearance")
                      ? "bg-gradient-primary text-white shadow-glow"
                      : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  }`}
                >
                  Appearance
                </Link>
                <Link
                  href="/dashboard/analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-xl text-base font-medium transition-all ${
                    isActive("/dashboard/analytics")
                      ? "bg-gradient-primary text-white shadow-glow"
                      : "text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  }`}
                >
                  Analytics
                </Link>
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 rounded-xl text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                  <ThemeToggle />
                </div>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-xl text-base font-medium bg-gradient-primary text-white hover:opacity-90 shadow-soft"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
