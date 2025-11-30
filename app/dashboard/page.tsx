"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getProfileById } from "@/lib/getProfile";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      loadProfile(user.id);
    });
  }, [router]);

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

  const handleCopy = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const profileUrl = `${baseUrl}/${profile.username}`;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
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
        handleCopy();
      }
    } else {
      // Fallback to copy if Web Share API is not available
      handleCopy();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  const profileUrl = profile?.username
    ? `${baseUrl}/${profile.username}`
    : "Complete your profile to get a public URL";

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-3 gradient-text">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your digital business card
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8 sm:mb-12">
          <Link
            href="/dashboard/profile"
            className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg hover:shadow-glow transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-4 shadow-soft group-hover:scale-110 transition-transform border border-white/20">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-semibold mb-3 text-gray-900 dark:text-white">Profile</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Update your profile information, photos, and contact details
            </p>
          </Link>

          <Link
            href="/dashboard/social"
            className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg hover:shadow-glow transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-4 shadow-soft group-hover:scale-110 transition-transform border border-white/20">
              <svg className="w-8 h-8 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-semibold mb-3 text-gray-900 dark:text-white">Social Links</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Add and manage your social media links
            </p>
          </Link>

          <Link
            href="/dashboard/appearance"
            className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg hover:shadow-glow transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-4 shadow-soft group-hover:scale-110 transition-transform border border-white/20">
              <svg className="w-8 h-8 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-semibold mb-3 text-gray-900 dark:text-white">Appearance</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Customize your profile theme and styling
            </p>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg hover:shadow-glow transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-4 shadow-soft group-hover:scale-110 transition-transform border border-white/20">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-semibold mb-3 text-gray-900 dark:text-white">Analytics</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              View your profile views and link clicks
            </p>
          </Link>
        </div>

        <div className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg">
          <h2 className="text-2xl font-heading font-semibold mb-6 text-gray-900 dark:text-white">Your Public Profile</h2>
          {profile?.username ? (
            <div className="space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400">Share this URL:</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={profileUrl}
                  readOnly
                  className="flex-1 px-4 py-3 text-base border border-gray-300/50 dark:border-gray-600/50 rounded-2xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleCopy}
                    className="px-6 py-3 bg-gradient-primary text-white rounded-2xl hover:opacity-90 transition-all duration-200 text-base font-semibold shadow-soft hover:shadow-glow whitespace-nowrap"
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-6 py-3 bg-gradient-secondary text-white rounded-2xl hover:opacity-90 transition-all duration-200 text-base font-semibold shadow-soft hover:shadow-glow whitespace-nowrap flex items-center gap-2"
                    title="Share profile"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
              <Link
                href={`/${profile.username}`}
                target="_blank"
                className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-base font-medium transition-colors"
              >
                View your profile
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          ) : (
            <p className="text-base text-gray-600 dark:text-gray-400">
              Complete your profile to get a public URL.{" "}
              <Link href="/dashboard/profile" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">
                Get started →
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
