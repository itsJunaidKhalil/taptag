import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Shared admin guard used by every `/api/admin/*` route.
 *
 * Resolves to either:
 *   { user, admin } -> caller is authenticated AND profiles.role === 'admin'
 *   { error }       -> a ready-to-return NextResponse with the right status
 *
 * Uses the SERVICE ROLE key for the role lookup so RLS can't accidentally
 * hide the row from us. Every mutation in the admin API must run through
 * this helper.
 */
export async function requireAdmin(req: NextRequest): Promise<
  | { user: User; admin: SupabaseClient; error?: never }
  | { error: NextResponse; user?: never; admin?: never }
> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const token = authHeader.replace("Bearer ", "");

  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
  );
  const {
    data: { user },
    error: authError,
  } = await anon.auth.getUser(token);
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

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      error: NextResponse.json({ error: profileError.message }, { status: 500 }),
    };
  }
  if (!profile || profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user, admin };
}

/**
 * Append an action to audit_log. Best-effort: errors here are logged
 * but never thrown, so an audit failure cannot block the underlying
 * operation.
 */
export async function recordAuditLog(
  admin: SupabaseClient,
  actorId: string,
  action: string,
  targetKind?: string,
  targetId?: string,
  meta?: Record<string, any>,
) {
  try {
    await admin.from("audit_log").insert({
      actor_id: actorId,
      action,
      target_kind: targetKind ?? null,
      target_id: targetId ?? null,
      meta: meta ?? null,
    });
  } catch (e) {
    console.error("[recordAuditLog] failed to write audit row:", e);
  }
}
