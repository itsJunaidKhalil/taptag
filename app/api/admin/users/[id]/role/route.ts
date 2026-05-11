import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, recordAuditLog } from "@/lib/admin";

export const dynamic = "force-dynamic";

// Grant or revoke admin role. Self-demotion is blocked so an admin
// can't lock everyone (including themselves) out by accident.
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

  const body = await req.json().catch(() => ({}));
  const role = body?.role;
  if (role !== "user" && role !== "admin") {
    return NextResponse.json(
      { error: "role must be 'user' or 'admin'" },
      { status: 400 },
    );
  }

  if (id === actor.id && role !== "admin") {
    return NextResponse.json(
      { error: "You cannot demote yourself. Ask another admin." },
      { status: 400 },
    );
  }

  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await recordAuditLog(admin, actor.id, "user.role_change", "user", id, { role });
  return NextResponse.json({ success: true, role });
}
