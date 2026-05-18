import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

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
  const sinceDate = new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10);
  const sinceIso = new Date(Date.now() - days * DAY_MS).toISOString();

  const [legacyCountRes, eventsCountRes, dailyRes, recentRes, byTypeRes] = await Promise.all([
    admin.from("analytics").select("id", { count: "exact", head: true }).eq("profile_id", profileId),
    admin
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("is_bot", false),
    admin
      .from("analytics_daily")
      .select("date, views, link_clicks, link_shares, vcf_downloads, mobile_views, desktop_views")
      .eq("profile_id", profileId)
      .gte("date", sinceDate)
      .order("date", { ascending: true }),
    admin
      .from("analytics_events")
      .select("id, event_type, link_id, referrer, country, device_type, created_at")
      .eq("profile_id", profileId)
      .eq("is_bot", false)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(25),
    admin
      .from("analytics_events")
      .select("event_type")
      .eq("profile_id", profileId)
      .eq("is_bot", false)
      .gte("created_at", sinceIso)
      .limit(10000),
  ]);

  const period = (dailyRes.data ?? []).reduce(
    (acc, r) => ({
      views: acc.views + (r.views ?? 0),
      link_clicks: acc.link_clicks + (r.link_clicks ?? 0),
      link_shares: acc.link_shares + (r.link_shares ?? 0),
      vcf_downloads: acc.vcf_downloads + (r.vcf_downloads ?? 0),
    }),
    { views: 0, link_clicks: 0, link_shares: 0, vcf_downloads: 0 },
  );

  const byEventType: Record<string, number> = {};
  for (const row of byTypeRes.data ?? []) {
    const t = row.event_type || "unknown";
    byEventType[t] = (byEventType[t] ?? 0) + 1;
  }

  return NextResponse.json({
    days,
    legacyEventCount: legacyCountRes.count ?? 0,
    eventsTotal: eventsCountRes.count ?? 0,
    period,
    dailySeries: dailyRes.data ?? [],
    byEventType,
    recentEvents: recentRes.data ?? [],
  });
}
