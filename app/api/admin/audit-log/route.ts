import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const MAX_LIMIT = 200;

// Recent admin actions, newest first. Surfaces what other operators
// have been doing so multi-admin moderation stays transparent.
export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if ("error" in ctx) return ctx.error;
  const { admin } = ctx;

  const sp = req.nextUrl.searchParams;
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(sp.get("limit") || "50", 10)),
  );

  const { data, error } = await admin
    .from("audit_log")
    .select("id, actor_id, action, target_kind, target_id, meta, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Resolve actor usernames in one batch.
  const actorIds = Array.from(
    new Set((data ?? []).map((r) => r.actor_id).filter(Boolean)),
  );
  let actors: Record<string, { username: string | null; full_name: string | null }> =
    {};
  if (actorIds.length > 0) {
    const { data: profs } = await admin
      .from("profiles")
      .select("id, username, full_name")
      .in("id", actorIds as string[]);
    actors = Object.fromEntries(
      (profs ?? []).map((p: any) => [p.id, { username: p.username, full_name: p.full_name }]),
    );
  }

  const rows = (data ?? []).map((r) => ({
    ...r,
    actor: r.actor_id ? actors[r.actor_id] ?? null : null,
  }));

  return NextResponse.json({ rows });
}
