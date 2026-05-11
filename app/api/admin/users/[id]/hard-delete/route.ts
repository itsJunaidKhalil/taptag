import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, recordAuditLog } from "@/lib/admin";

export const dynamic = "force-dynamic";

// Hard delete a user immediately. Cascades through profile -> social_links
// / analytics / username_redirects / reports because of the FK ON DELETE
// CASCADE on every dependent table. The auth.users row is also deleted
// so the email can be reused.
//
// Refuses to delete another admin (defense against accidental footguns).
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ctx = await requireAdmin(req);
  if ("error" in ctx) return ctx.error;
  const { user: actor, admin } = ctx;

  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Don't let the operator nuke themselves accidentally.
  if (id === actor.id) {
    return NextResponse.json(
      { error: "You cannot hard-delete your own account this way." },
      { status: 400 },
    );
  }

  const { data: target, error: targetErr } = await admin
    .from("profiles")
    .select("id, role, username, deleted_at")
    .eq("id", id)
    .maybeSingle();

  if (targetErr) {
    return NextResponse.json({ error: targetErr.message }, { status: 500 });
  }
  if (target?.role === "admin") {
    return NextResponse.json(
      { error: "Cannot hard-delete another admin." },
      { status: 400 },
    );
  }

  // Capture metadata for the audit log BEFORE we delete the rows.
  const meta = {
    username: target?.username ?? null,
    wasSoftDeleted: !!target?.deleted_at,
  };

  // 1) Remove the profile row. Dependent rows cascade.
  const { error: profileDelErr } = await admin
    .from("profiles")
    .delete()
    .eq("id", id);
  if (profileDelErr) {
    return NextResponse.json({ error: profileDelErr.message }, { status: 500 });
  }

  // 2) Remove the auth user so the email is freed.
  const { error: authDelErr } = await admin.auth.admin.deleteUser(id);
  if (authDelErr) {
    // Profile row is already gone; log loudly but don't 500 — the user
    // record is effectively orphaned and a follow-up purge can clean it.
    console.error("[admin/hard-delete] auth.admin.deleteUser failed:", authDelErr);
  }

  await recordAuditLog(admin, actor.id, "user.hard_delete", "user", id, meta);

  return NextResponse.json({ success: true, deletedUserId: id });
}
