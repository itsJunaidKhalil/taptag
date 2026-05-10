import { notFound, redirect, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { getProfile } from "@/lib/getProfile";
import ProfilePageContent from "@/components/ProfilePage";

// Disable caching for this page to ensure fresh data
export const revalidate = 0;
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://taptag.biz";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  let profile: any = null;
  try {
    profile = await getProfile(params.username);
  } catch {
    return {
      title: "Profile not found",
      robots: { index: false, follow: false },
    };
  }
  if (!profile) {
    return {
      title: "Profile not found",
      robots: { index: false, follow: false },
    };
  }

  const displayName = profile.full_name || profile.username || params.username;
  const title = `${displayName}${profile.company ? ` — ${profile.company}` : ""}`;
  const description =
    profile.about ||
    `${displayName}'s digital business card on TapTag. Connect, save contact, follow socials.`;
  const url = `${SITE_URL}/${profile.username}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      title,
      description,
      url,
      siteName: "TapTag",
      images: [`/${profile.username}/opengraph-image`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/${profile.username}/twitter-image`],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  // Check for redirect chain FIRST before trying to get profile
  const { createServerClient } = await import("@/lib/supabase-server");
  const supabase = createServerClient();
  
  try {
    
    let currentUsername = params.username;
    const visitedUsernames = new Set<string>();
    let redirectChain: string[] = [params.username];
    let hasRedirect = false;
    
    // Follow redirect chain to find final username
    for (let i = 0; i < 10; i++) {
      if (visitedUsernames.has(currentUsername)) {
        console.error(`[ProfilePage] Circular redirect detected for username: ${params.username}`);
        break; // Circular redirect detected
      }
      visitedUsernames.add(currentUsername);
      
      const { data: redirectData, error: redirectError } = await supabase
        .from("username_redirects")
        .select("new_username")
        .eq("old_username", currentUsername)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors
      
      if (redirectError) {
        console.error(`[ProfilePage] Error checking redirect for ${currentUsername}:`, redirectError);
        break;
      }
      
      if (!redirectData?.new_username) {
        break; // No more redirects
      }
      
      hasRedirect = true;
      currentUsername = redirectData.new_username;
      redirectChain.push(currentUsername);
    }
    
    // If we found a redirect chain, do HTTP 301 redirect for SEO
    if (hasRedirect && currentUsername !== params.username) {
      console.log(`[ProfilePage] Redirecting ${params.username} → ${currentUsername}`);
      // Use permanent redirect (301) for SEO
      permanentRedirect(`/${currentUsername}`);
    }
    
    // Fetch profile with final username (getProfile also handles redirects internally as fallback)
    let profile;
    try {
      profile = await getProfile(currentUsername);
    } catch (profileError: any) {
      // If profile not found, check one more time if there's a redirect we missed
      if (profileError?.code === 'PGRST116' || profileError?.message?.includes('No rows')) {
        console.log(`[ProfilePage] Profile not found for ${currentUsername}, checking for missed redirects...`);
        // Double-check redirects for the original username
        const { data: finalRedirect } = await supabase
          .from("username_redirects")
          .select("new_username")
          .eq("old_username", params.username)
          .maybeSingle();
        
        if (finalRedirect?.new_username && finalRedirect.new_username !== currentUsername) {
          console.log(`[ProfilePage] Found missed redirect: ${params.username} → ${finalRedirect.new_username}`);
          permanentRedirect(`/${finalRedirect.new_username}`);
        }
      }
      throw profileError;
    }
    
    if (!profile) {
      console.error(`[ProfilePage] Profile not found for username: ${currentUsername}`);
      notFound();
    }

    return <ProfilePageContent profile={profile} />;
  } catch (error: any) {
    console.error("[ProfilePage] Error loading profile:", error);
    // If it's a redirect error, let it propagate
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    notFound();
  }
}
