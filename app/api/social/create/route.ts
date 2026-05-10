import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.id !== body.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Use the service role when available so we can defensively upsert the
    // profiles row that owns this link. Without this, users whose profile
    // row never got created (legacy signups, failed callback, etc) hit
    // social_links_user_id_fkey on every Add Link.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_KEY!,
      serviceRoleKey
        ? { auth: { persistSession: false, autoRefreshToken: false } }
        : { global: { headers: { Authorization: `Bearer ${token}` } } },
    );

    // Self-heal: make sure the FK target exists. No-op if profile already exists.
    const { error: profileEnsureError } = await supabase
      .from("profiles")
      .upsert(
        { id: user.id, email: user.email, updated_at: new Date().toISOString() },
        { onConflict: "id", ignoreDuplicates: true },
      );
    if (profileEnsureError) {
      console.warn("Profile ensure failed (continuing):", profileEnsureError);
    }

    const { data, error } = await supabase
      .from("social_links")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("Social link create error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: [data], error: null });
  } catch (error: any) {
    console.error("Social link create exception:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
