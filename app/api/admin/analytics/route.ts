import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const DAY_MS = 86400000;

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if ("error" in ctx) return ctx.error;
  const { admin } = ctx;

  const days = Math.min(30, Math.max(1, Number(req.nextUrl.searchParams.get("days") ?? "7")));
  const sinceDate = new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10);
  const sinceIso = new Date(Date.now() - days * DAY_MS).toISOString();

  const [dailyRes, eventsCountRes, eventTypeRes, topProfilesRes] = await Promise.all([
    admin.from("analytics_daily").select("views, link_clicks, link_shares, vcf_downloads").gte("date", sinceDate),
    admin
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("is_bot", false)
      .gte("created_at", sinceIso),
    admin
      .from("analytics_events")
      .select("event_type")
      .eq("is_bot", false)
      .gte("created_at", sinceIso)
      .limit(50000),
    admin
      .from("analytics_daily")
      .select("profile_id, views, link_clicks")
      .gte("date", sinceDate),
  ]);

  const daily = dailyRes.data ?? [];
  const totals = {
    views: daily.reduce((s, r) => s + (r.views ?? 0), 0),
    link_clicks: daily.reduce((s, r) => s + (r.link_clicks ?? 0), 0),
    link_shares: daily.reduce((s, r) => s + (r.link_shares ?? 0), 0),
    vcf_downloads: daily.reduce((s, r) => s + (r.vcf_downloads ?? 0), 0),
    raw_events: eventsCountRes.count ?? 0,
  };

  const byEventType: Record<string, number> = {};
  for (const row of eventTypeRes.data ?? []) {
    const t = row.event_type || "unknown";
    byEventType[t] = (byEventType[t] ?? 0) + 1;
  }

  const profileTotals = new Map<string, { views: number; clicks: number }>();
  for (const row of topProfilesRes.data ?? []) {
    const cur = profileTotals.get(row.profile_id) ?? { views: 0, clicks: 0 };
    cur.views += row.views ?? 0;
    cur.clicks += row.link_clicks ?? 0;
    profileTotals.set(row.profile_id, cur);
  }

  const topProfileIds = Array.from(profileTotals.entries())
    .sort((a, b) => b[1].views - a[1].views || b[1].clicks - a[1].clicks)
    .slice(0, 10)
    .map(([id]) => id);

  let topProfiles: Array<{
    profile_id: string;
    username: string | null;
    full_name: string | null;
    views: number;
    link_clicks: number;
  }> = [];

  if (topProfileIds.length) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, username, full_name")
      .in("id", topProfileIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    topProfiles = topProfileIds.map((id) => {
      const p = profileMap.get(id);
      const t = profileTotals.get(id)!;
      return {
        profile_id: id,
        username: p?.username ?? null,
        full_name: p?.full_name ?? null,
        views: t.views,
        link_clicks: t.clicks,
      };
    });
  }

  return NextResponse.json({
    days,
    totals,
    byEventType,
    topProfiles,
  });
}
