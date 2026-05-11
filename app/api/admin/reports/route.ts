import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const MAX_PAGE_SIZE = 100;

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if ("error" in ctx) return ctx.error;
  const { admin } = ctx;

  const sp = req.nextUrl.searchParams;
  const status = (sp.get("status") || "open").toLowerCase();
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(sp.get("pageSize") || "25", 10)),
  );

  let query = admin
    .from("reports")
    .select(
      "id, profile_id, reported_username, reason, details, status, resolved_at, resolved_by, resolution_note, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    rows: data ?? [],
    page,
    pageSize,
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  });
}
