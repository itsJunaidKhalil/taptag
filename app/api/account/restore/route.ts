import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    const auth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    );
    const {
      data: { user },
      error: authError,
    } = await auth.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Server is missing SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 },
      );
    }
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Look up the profile first so we can verify it's still inside the
    // recovery window before restoring it.
    const { data: profile, error: lookupErr } = await admin
      .from("profiles")
      .select("id, deleted_at, scheduled_deletion_at")
      .eq("id", user.id)
      .maybeSingle();

    if (lookupErr) {
      return NextResponse.json({ error: lookupErr.message }, { status: 400 });
    }
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    if (!profile.deleted_at) {
      return NextResponse.json({ success: true, alreadyActive: true });
    }
    if (
      profile.scheduled_deletion_at &&
      new Date(profile.scheduled_deletion_at).getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: "Recovery window has expired" },
        { status: 410 },
      );
    }

    const { error: updateError } = await admin
      .from("profiles")
      .update({ deleted_at: null, scheduled_deletion_at: null })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, restored: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
