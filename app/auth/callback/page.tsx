"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Handling auth callback...");
        console.log("Current URL:", window.location.href);
        console.log("Hash:", window.location.hash);

        // Handle hash-based redirect (from OAuth - Supabase uses hash fragments)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        console.log("Access token present:", !!accessToken);
        console.log("Refresh token present:", !!refreshToken);
        console.log("Error:", error);

        if (error) {
          console.error("OAuth error:", error, errorDescription);
          setError(errorDescription || error);
          setTimeout(() => {
            router.push(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`);
          }, 2000);
          return;
        }

        if (accessToken && refreshToken) {
          console.log("Setting session with tokens...");
          
          // Set the session
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error("Session error:", sessionError);
            throw sessionError;
          }

          console.log("Session set successfully, user:", data.user?.id);

          if (data.user) {
            // Check if profile exists, if not create one
            const { data: existingProfile, error: profileCheckError } = await supabase
              .from("profiles")
              .select("id")
              .eq("id", data.user.id)
              .single();

            if (profileCheckError && profileCheckError.code === 'PGRST116') {
              // Profile doesn't exist, create it
              console.log("Creating profile for new user...");
              const { error: profileCreateError } = await supabase.from("profiles").insert({
                id: data.user.id,
                email: data.user.email,
              });

              if (profileCreateError) {
                console.error("Error creating profile:", profileCreateError);
                // Don't throw - user is still authenticated
              } else {
                console.log("Profile created successfully");
              }
            } else if (existingProfile) {
              console.log("Profile already exists");
            }

            // Clear the hash and redirect
            window.history.replaceState(null, "", window.location.pathname);
            console.log("Redirecting to dashboard...");
            router.push("/dashboard");
            router.refresh();
          } else {
            throw new Error("No user data received");
          }
        } else {
          // No tokens in hash - might be a different flow
          console.log("No tokens in hash, checking for code...");
          
          // Check if there's a code in query params (server-side flow)
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get("code");
          
          if (code) {
            console.log("Code found, waiting for server redirect...");
            // Server route should handle this, but wait a moment
            setTimeout(() => {
              router.push("/dashboard");
            }, 1000);
          } else {
            console.error("No authentication data found");
            setError("No authentication data received");
            setTimeout(() => {
              router.push("/auth/login?error=No authentication data received");
            }, 2000);
          }
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setError(error.message || "Authentication failed");
        setTimeout(() => {
          router.push(`/auth/login?error=${encodeURIComponent(error.message || "Authentication failed")}`);
        }, 2000);
      }
    };

    // Small delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      handleAuthCallback();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 mb-2">Error: {error}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Please wait</p>
          </>
        )}
      </div>
    </div>
  );
}
