"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import SocialLinksForm from "@/components/SocialLinksForm";

export default function SocialPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      loadLinks(user.id);
    });
  }, [router]);

  const loadLinks = async (userId: string) => {
    try {
      // Get authenticated session to pass token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("No session found");
        setLinks([]);
        return;
      }

      // Use authenticated API route instead of server function
      const response = await fetch(`/api/social/list?user_id=${userId}`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch links");
      }

      const result = await response.json();
      setLinks(result.data || []);
    } catch (error) {
      console.error("Error loading links:", error);
      setLinks([]);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-3 gradient-text">Social Links</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Manage your social media links</p>
        </div>
        <div className="glass p-6 sm:p-8 rounded-3xl shadow-soft-lg">
          <SocialLinksForm 
            userId={user.id} 
            initialLinks={links}
            onLinkAdded={() => loadLinks(user.id)}
          />
        </div>
      </div>
    </div>
  );
}
