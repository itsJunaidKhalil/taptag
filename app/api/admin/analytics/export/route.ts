import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { rowsToCsv } from "@/lib/analytics/csv";

export const dynamic = "force-dynamic";

const DAY_MS = 86400000;

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if ("error" in ctx) return ctx.error;
  const { admin } = ctx;

  const days = Math.min(30, Math.max(1, Number(req.nextUrl.searchParams.get("days") ?? "7")));
  const sinceIso = new Date(Date.now() - days * DAY_MS).toISOString();

  const { data: events, error } = await admin
    .from("analytics_events")
    .select(
      "created_at, profile_id, event_type, link_id, country, city, device_type, referrer, utm_source, utm_medium, utm_campaign, is_bot",
    )
    .eq("is_bot", false)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(50000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const headers = [
    "created_at",
    "profile_id",
    "event_type",
    "link_id",
    "country",
    "city",
    "device_type",
    "referrer",
    "utm_source",
    "utm_medium",
    "utm_campaign",
  ];

  const csv = rowsToCsv(headers, (events ?? []) as Record<string, string | null>[]);
  const filename = `taptag-platform-analytics-${days}d-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
