"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github" | "linkedin") => {
    setLoading(true);
    setError("");

    try {
      // Get the correct redirect URL - prioritize environment variable
      const redirectUrl = typeof window !== "undefined" 
        ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
        : process.env.NEXT_PUBLIC_APP_URL || "";
      
      console.log("OAuth redirect URL:", `${redirectUrl}/auth/callback`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${redirectUrl}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error("OAuth error:", error);
        throw error;
      }

      // The redirect happens automatically, so we don't need to do anything here
      // Supabase will handle the OAuth flow
    } catch (error: any) {
      console.error("Social login error:", error);
      setError(error.message || "Failed to initiate OAuth login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="glass rounded-3xl shadow-soft-lg p-6 sm:p-8 border border-gray-200/50 dark:border-gray-700/50">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-center mb-2 gradient-text">Login</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Welcome back!</p>
            
            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 glass border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 disabled:opacity-50 shadow-soft hover:shadow-soft-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Continue with Google
                </span>
              </button>

              <button
                onClick={() => handleSocialLogin("github")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 dark:bg-gray-800 border-2 border-gray-900 dark:border-gray-700 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 shadow-soft hover:shadow-soft-lg"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="font-medium text-white">
                  Continue with GitHub
                </span>
              </button>

              <button
                onClick={() => handleSocialLogin("linkedin")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-700 border-2 border-blue-700 rounded-2xl hover:bg-blue-800 transition-all duration-300 disabled:opacity-50 shadow-soft hover:shadow-soft-lg"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="font-medium text-white">
                  Continue with LinkedIn
                </span>
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl shadow-soft">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white transition-all shadow-soft"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white transition-all shadow-soft"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-primary text-white rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all duration-300 font-semibold shadow-soft-lg hover:shadow-glow transform hover:scale-[1.02]"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <div className="mt-6 text-center text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-primary-600 dark:text-primary-400 hover:underline font-semibold transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
