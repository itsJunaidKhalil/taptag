import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// 30-day soft-delete recovery window. After this elapses, a separate cron
// job is expected to permanently delete the row (and cascade delete its
// social_links / analytics via FK constraints).
const RECOVERY_DAYS = 30;

async function authedAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
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
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return {
      error: NextResponse.json(
        { error: "Server is missing SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 },
      ),
    };
  }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { user, admin };
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await authedAdmin(req);
    if ("error" in ctx) return ctx.error;
    const { user, admin } = ctx;

    const now = new Date();
    const scheduled = new Date(now.getTime() + RECOVERY_DAYS * 86400000);

    // Mark the profile as scheduled for deletion. We DO NOT delete the
    // auth user here — that happens during the cron purge so the user
    // can still sign in and restore the account during the recovery
    // window.
    const { error: updateError } = await admin
      .from("profiles")
      .update({
        deleted_at: now.toISOString(),
        scheduled_deletion_at: scheduled.toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      // If the profile row doesn't exist, treat as a no-op success.
      if (updateError.code !== "PGRST116") {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      deleted_at: now.toISOString(),
      scheduled_deletion_at: scheduled.toISOString(),
      recovery_days: RECOVERY_DAYS,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
