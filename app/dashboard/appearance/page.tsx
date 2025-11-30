"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getProfileById } from "@/lib/getProfile";
import { themes, ThemeName } from "@/utils/themes";
import Navbar from "@/components/Navbar";

export default function AppearancePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleThemeChange = async (theme: ThemeName) => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError("You must be logged in to change themes. Please refresh the page.");
        setSaving(false);
        return;
      }

      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: user.id, theme }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to update theme");
      }

      setProfile({ ...profile, theme });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error updating theme:", error);
      setError(error.message || "Error updating theme. Please try again.");
    } finally {
      setSaving(false);
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

  const currentTheme = (profile?.theme as ThemeName) || "default";

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-3 gradient-text">Appearance</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose a theme for your public profile
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl shadow-soft">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl shadow-soft">
            <p className="text-sm text-green-600 dark:text-green-400">
              Theme updated successfully!
            </p>
          </div>
        )}

        <div className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg">
          <h2 className="text-2xl font-heading font-semibold mb-6 text-gray-900 dark:text-white">Choose Theme</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {(Object.keys(themes) as ThemeName[]).map((themeName) => {
              const theme = themes[themeName];
              const isSelected = currentTheme === themeName;

              return (
                <button
                  key={themeName}
                  onClick={() => handleThemeChange(themeName)}
                  disabled={saving}
                  className={`p-6 border-2 rounded-2xl text-left transition-all duration-300 hover:shadow-soft-lg transform hover:-translate-y-1 ${
                    isSelected
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-glow"
                      : "border-gray-200/50 dark:border-gray-700/50 hover:border-primary-300 dark:hover:border-primary-700"
                  } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-heading font-semibold text-lg capitalize text-gray-900 dark:text-white">
                      {themeName}
                    </span>
                    {isSelected && (
                      <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-soft">
                        ✓
                      </div>
                    )}
                  </div>
                  <div
                    className="h-28 rounded-xl flex items-center justify-center shadow-soft"
                    style={{
                      backgroundColor: theme.bg,
                      color: theme.text,
                    }}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium mb-1">Preview</div>
                      <div className="text-xs opacity-75">Sample text</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {profile?.username && (
          <div className="mt-6 glass p-6 rounded-2xl shadow-soft-lg border border-primary-200/50 dark:border-primary-800/50">
            <p className="text-sm text-primary-700 dark:text-primary-300">
              💡 Preview your theme by visiting{" "}
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
              >
                your public profile
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
