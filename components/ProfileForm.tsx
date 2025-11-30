"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ImageUploader from "./ImageUploader";

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

interface ProfileFormProps {
  profile: Profile | null;
  userId: string;
}

export default function ProfileForm({ profile, userId }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    full_name: profile?.full_name || "",
    company: profile?.company || "",
    about: profile?.about || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    website: profile?.website || "",
    profile_image_url: profile?.profile_image_url || "",
    banner_image_url: profile?.banner_image_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        full_name: profile.full_name || "",
        company: profile.company || "",
        about: profile.about || "",
        phone: profile.phone || "",
        email: profile.email || "",
        website: profile.website || "",
        profile_image_url: profile.profile_image_url || "",
        banner_image_url: profile.banner_image_url || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    setCopied(false);

    try {
      // Get the current session to pass auth token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError("You must be logged in to save your profile. Please refresh the page.");
        setSaving(false);
        return;
      }

      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "X-Refresh-Token": session.refresh_token || ""
        },
        body: JSON.stringify({ ...formData, id: userId }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to update profile");
      }

      setSuccess(true);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message || "Error updating profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWebsiteBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = e.target.value.trim();
    if (value && !value.match(/^https?:\/\//i)) {
      // Add https:// if URL doesn't start with http:// or https://
      value = `https://${value}`;
      setFormData({
        ...formData,
        website: value,
      });
    }
  };

  const getProfileUrl = () => {
    if (!formData.username) return null;
    const baseUrl = typeof window !== "undefined" 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com";
    return `${baseUrl}/${formData.username}`;
  };

  const handleCopyLink = () => {
    const url = getProfileUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const url = getProfileUrl();
    if (!url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: formData.full_name || formData.username || "My Profile",
          text: `Check out my profile: ${formData.full_name || formData.username}`,
          url: url,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log("Share cancelled");
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  const profileUrl = getProfileUrl();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-3xl font-heading font-bold mb-2 gradient-text">Profile Information</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Update your profile details</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ImageUploader
          userId={userId}
          bucket="profile-images"
          currentUrl={formData.profile_image_url}
          onUploadComplete={(url) => setFormData({ ...formData, profile_image_url: url })}
          label="Profile Picture"
        />

        <ImageUploader
          userId={userId}
          bucket="banners"
          currentUrl={formData.banner_image_url}
          onUploadComplete={(url) => setFormData({ ...formData, banner_image_url: url })}
          label="Banner Image"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Username *
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border-2 border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white transition-all shadow-soft"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Your profile will be available at: /{formData.username || "username"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Full Name
        </label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white transition-all shadow-soft"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Company
        </label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white transition-all shadow-soft"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          About
        </label>
        <textarea
          name="about"
          value={formData.about}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white transition-all shadow-soft resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white transition-all shadow-soft"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white transition-all shadow-soft"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Website
        </label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          onBlur={handleWebsiteBlur}
          placeholder="example.com or https://example.com"
          className="w-full px-4 py-3 border-2 border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white transition-all shadow-soft"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          We'll automatically add https:// if you don't include it
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl shadow-soft">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl shadow-soft-lg">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-1">
                Profile Updated Successfully! 🎉
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400 mb-4">
                Your profile has been saved. Here's your public profile link:
              </p>
              
              {profileUrl ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={profileUrl}
                      readOnly
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-md text-sm text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-6 py-3 bg-gradient-secondary text-white rounded-2xl hover:opacity-90 transition-all duration-300 text-sm font-semibold whitespace-nowrap shadow-soft hover:shadow-glow-secondary"
                    >
                      {copied ? "✓ Copied!" : "Copy Link"}
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/${formData.username}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-2xl hover:opacity-90 transition-all duration-300 text-sm font-semibold shadow-soft hover:shadow-glow"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View Profile
                    </Link>
                    
                    <button
                      type="button"
                      onClick={handleShare}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-accent text-white rounded-2xl hover:opacity-90 transition-all duration-300 text-sm font-semibold shadow-soft hover:shadow-soft-lg"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-green-700 dark:text-green-400">
                  Please set a username to get your public profile link.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="px-8 py-4 bg-gradient-primary text-white rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-soft-lg hover:shadow-glow transform hover:scale-[1.02] disabled:transform-none"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
