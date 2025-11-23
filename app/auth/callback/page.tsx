"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle hash-based redirect (from OAuth)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        if (error) {
          console.error("OAuth error:", error, errorDescription);
          router.push(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`);
          return;
        }

        if (accessToken && refreshToken) {
          // Set the session
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }

          if (data.user) {
            // Check if profile exists, if not create one
            const { data: existingProfile } = await supabase
              .from("profiles")
              .select("id")
              .eq("id", data.user.id)
              .single();

            if (!existingProfile) {
              // Create profile for OAuth users
              await supabase.from("profiles").insert({
                id: data.user.id,
                email: data.user.email,
              });
            }

            // Clear the hash and redirect
            window.location.hash = "";
            router.push("/dashboard");
            router.refresh();
          }
        } else {
          // Handle code-based redirect (from server route)
          const code = searchParams.get("code");
          if (code) {
            // The server route should handle this, but if we're here, redirect
            router.push("/dashboard");
          } else {
            router.push("/auth/login?error=No authentication data received");
          }
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        router.push(`/auth/login?error=${encodeURIComponent(error.message || "Authentication failed")}`);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
}

