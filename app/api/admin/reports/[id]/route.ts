import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, recordAuditLog } from "@/lib/admin";

export const dynamic = "force-dynamic";

const ALLOWED_STATUSES = ["open", "resolved", "dismissed"] as const;
type ReportStatus = (typeof ALLOWED_STATUSES)[number];

// Update a report's status. Used to triage the reports queue.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ctx = await requireAdmin(req);
  if ("error" in ctx) return ctx.error;
  const { user: actor, admin } = ctx;

  const id = parseInt(params.id, 10);
  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const status = String(body?.status || "").toLowerCase();
  const note = body?.note ? String(body.note).slice(0, 1000) : null;

  if (!(ALLOWED_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }
  const typedStatus = status as ReportStatus;

  const update: Record<string, any> = { status: typedStatus };
  if (typedStatus === "open") {
    update.resolved_at = null;
    update.resolved_by = null;
    update.resolution_note = null;
  } else {
    update.resolved_at = new Date().toISOString();
    update.resolved_by = actor.id;
    update.resolution_note = note;
  }

  const { data, error } = await admin
    .from("reports")
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  await recordAuditLog(
    admin,
    actor.id,
    `report.${typedStatus}`,
    "report",
    String(id),
    { profile_id: data.profile_id, note },
  );

  return NextResponse.json({ success: true, report: data });
}
