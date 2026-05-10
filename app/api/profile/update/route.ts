import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    );
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);
    if (authError || !user) {
      console.error("Auth verification failed:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_KEY!,
      serviceRoleKey
        ? { auth: { persistSession: false, autoRefreshToken: false } }
        : { global: { headers: { Authorization: `Bearer ${token}` } } },
    );

    // Read current username (if any) so we can record a redirect when it changes.
    // Using maybeSingle so a missing profile row does not throw (it just becomes null).
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("id", id)
      .maybeSingle();

    const oldUsername = existingProfile?.username || null;
    const newUsername = updateData.username ?? null;
    const now = new Date().toISOString();

    // Single atomic upsert — creates the row if missing, updates it if present.
    // This is the self-healing fix for users whose profile row never got created
    // at signup (otherwise social_links FK violations follow).
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id,
          email: user.email,
          ...updateData,
          updated_at: now,
        },
        { onConflict: "id" },
      )
      .select()
      .single();

    if (error) {
      console.error("Profile upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) {
      return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
    }

    // Record a redirect when the user changes their username.
    if (oldUsername && newUsername && oldUsername !== newUsername) {
      try {
        await supabase
          .from("username_redirects")
          .upsert(
            {
              old_username: oldUsername,
              new_username: newUsername,
              user_id: id,
              created_at: now,
            },
            { onConflict: "old_username" },
          );
      } catch (redirectError) {
        console.warn("Could not create username redirect:", redirectError);
      }
    }

    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    console.error("Profile update exception:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
