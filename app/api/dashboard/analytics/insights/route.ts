import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  aggregateLabelCounts,
  formatReferrerLabel,
  formatUtmLabel,
} from "@/lib/analytics/insights";
import { ANALYTICS_DASHBOARD_DAYS } from "@/lib/analytics/dashboard";

export const dynamic = "force-dynamic";

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
  const sinceIso = new Date(Date.now() - days * 86400000).toISOString();

  const { data: events, error } = await supabase
    .from("analytics_events")
    .select("referrer, utm_source, utm_medium, utm_campaign, country, device_type")
    .eq("profile_id", user.id)
    .eq("is_bot", false)
    .eq("event_type", "profile_view")
    .gte("created_at", sinceIso)
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = events ?? [];

  const referrers = aggregateLabelCounts(
    rows.map((r) => ({ label: r.referrer })),
    formatReferrerLabel,
  );

  const utmMap = new Map<string, number>();
  for (const r of rows) {
    const label = formatUtmLabel(r.utm_source, r.utm_medium, r.utm_campaign);
    if (label === "—") continue;
    utmMap.set(label, (utmMap.get(label) ?? 0) + 1);
  }
  const utm = Array.from(utmMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const countries = aggregateLabelCounts(
    rows.map((r) => ({ label: r.country || "Unknown" })),
    (l) => l || "Unknown",
  );

  const devices = aggregateLabelCounts(
    rows.map((r) => ({ label: r.device_type || "unknown" })),
    (l) => (l ? l.charAt(0).toUpperCase() + l.slice(1) : "Unknown"),
  );

  return NextResponse.json({ days, referrers, utm, countries, devices });
}
