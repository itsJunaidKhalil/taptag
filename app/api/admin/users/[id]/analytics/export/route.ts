import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { rowsToCsv } from "@/lib/analytics/csv";

export const dynamic = "force-dynamic";

const DAY_MS = 86400000;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ctx = await requireAdmin(req);
  if ("error" in ctx) return ctx.error;
  const { admin } = ctx;

  const profileId = params.id;
  if (!profileId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const days = Math.min(30, Math.max(1, Number(req.nextUrl.searchParams.get("days") ?? "7")));
  const sinceIso = new Date(Date.now() - days * DAY_MS).toISOString();

  const { data: events, error } = await admin
    .from("analytics_events")
    .select(
      "created_at, event_type, link_id, country, city, device_type, os, browser, referrer, utm_source, utm_medium, utm_campaign",
    )
    .eq("profile_id", profileId)
    .eq("is_bot", false)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(10000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const headers = [
    "created_at",
    "event_type",
    "link_id",
    "country",
    "city",
    "device_type",
    "os",
    "browser",
    "referrer",
    "utm_source",
    "utm_medium",
    "utm_campaign",
  ];

  const csv = rowsToCsv(headers, (events ?? []) as Record<string, string | null>[]);
  const filename = `taptag-user-${profileId.slice(0, 8)}-${days}d.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
