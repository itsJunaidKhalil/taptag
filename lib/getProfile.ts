import { createClient } from "@supabase/supabase-js";

const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  );
};

/**
 * Fetch a profile by username, walking the redirect chain.
 * Returns the profile row, or `null` when no profile (and no redirect) matches.
 * Only throws on actual errors (network, RLS), not on "not found".
 */
export async function getProfile(username: string) {
  const supabase = getSupabaseClient();

  let currentUsername = username;
  const visitedUsernames = new Set<string>();
  let redirectChain: string[] = [username];

  for (let i = 0; i < 10; i++) {
    if (visitedUsernames.has(currentUsername)) {
      console.error(
        `[getProfile] Circular redirect for username: ${username}, chain: ${redirectChain.join(" → ")}`,
      );
      break;
    }
    visitedUsernames.add(currentUsername);

    const { data: redirectData } = await supabase
      .from("username_redirects")
      .select("new_username")
      .eq("old_username", currentUsername)
      .maybeSingle();

    if (!redirectData?.new_username) break;

    currentUsername = redirectData.new_username;
    redirectChain.push(currentUsername);
  }

  if (redirectChain.length > 1) {
    console.log(`[getProfile] Username redirect chain: ${redirectChain.join(" → ")}`);
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", currentUsername)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    // PGRST116 = no rows. With maybeSingle this shouldn't happen, but be defensive.
    if ((error as any).code === "PGRST116") return null;
    console.error(
      `[getProfile] Error fetching profile for username: ${username}, finalUsername: ${currentUsername}`,
      error,
    );
    throw error;
  }

  return data;
}

/**
 * Fetch a profile by id. Returns the row or `null` when no row exists.
 * Only throws on actual errors.
 */
export async function getProfileById(id: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if ((error as any).code === "PGRST116") return null;
    throw error;
  }
  return data;
}
