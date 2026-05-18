import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  aggregateLabelCounts,
  formatReferrerLabel,
  formatUtmLabel,
} from "@/lib/analytics/insights";
import { ANALYTICS_DASHBOARD_DAYS } from "@/lib/analytics/dashboard";
import { buildFunnelFromTotals } from "@/lib/analytics/funnel";

export const dynamic = "force-dynamic";

function formatCityLabel(city: string | null, country: string | null): string {
  if (!city) return "Unknown";
  return country ? `${city}, ${country}` : city;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
  );
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );

  const days = ANALYTICS_DASHBOARD_DAYS;
  const sinceDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const sinceIso = new Date(Date.now() - days * 86400000).toISOString();

  const [eventsRes, dailyRes] = await Promise.all([
    supabase
      .from("analytics_events")
      .select(
        "referrer, utm_source, utm_medium, utm_campaign, country, city, device_type, event_type",
      )
      .eq("profile_id", user.id)
      .eq("is_bot", false)
      .gte("created_at", sinceIso)
      .limit(5000),
    supabase
      .from("analytics_daily")
      .select("views, link_clicks, vcf_downloads, contact_saves")
      .eq("profile_id", user.id)
      .gte("date", sinceDate),
  ]);

  if (eventsRes.error) {
    return NextResponse.json({ error: eventsRes.error.message }, { status: 500 });
  }

  const rows = eventsRes.data ?? [];
  const viewRows = rows.filter((r) => r.event_type === "profile_view");

  const referrers = aggregateLabelCounts(
    viewRows.map((r) => ({ label: r.referrer })),
    formatReferrerLabel,
  );

  const utmMap = new Map<string, number>();
  for (const r of viewRows) {
    const label = formatUtmLabel(r.utm_source, r.utm_medium, r.utm_campaign);
    if (label === "—") continue;
    utmMap.set(label, (utmMap.get(label) ?? 0) + 1);
  }
  const utm = Array.from(utmMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const countries = aggregateLabelCounts(
    viewRows.map((r) => ({ label: r.country || "Unknown" })),
    (l) => l || "Unknown",
  );

  const cities = aggregateLabelCounts(
    viewRows.map((r) => ({ label: formatCityLabel(r.city, r.country) })),
    (l) => l || "Unknown",
    10,
  );

  const devices = aggregateLabelCounts(
    viewRows.map((r) => ({ label: r.device_type || "unknown" })),
    (l) => (l ? l.charAt(0).toUpperCase() + l.slice(1) : "Unknown"),
  );

  const daily = dailyRes.data ?? [];
  const funnelTotals = {
    views: daily.reduce((s, r) => s + (r.views ?? 0), 0),
    link_clicks: daily.reduce((s, r) => s + (r.link_clicks ?? 0), 0),
    vcf_downloads: daily.reduce((s, r) => s + (r.vcf_downloads ?? 0), 0),
    contact_saves: daily.reduce((s, r) => s + (r.contact_saves ?? 0), 0),
  };

  if (funnelTotals.views === 0 && viewRows.length > 0) {
    funnelTotals.views = viewRows.length;
    funnelTotals.link_clicks = rows.filter((r) => r.event_type === "link_click").length;
    funnelTotals.vcf_downloads = rows.filter((r) => r.event_type === "vcf_download").length;
    funnelTotals.contact_saves = rows.filter((r) => r.event_type === "contact_save").length;
  }

  return NextResponse.json({
    days,
    referrers,
    utm,
    countries,
    cities,
    devices,
    funnel: buildFunnelFromTotals(funnelTotals),
  });
}
