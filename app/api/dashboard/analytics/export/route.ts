import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ANALYTICS_DASHBOARD_DAYS } from "@/lib/analytics/dashboard";

export const dynamic = "force-dynamic";

function csvEscape(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
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
  const sinceIso = new Date(Date.now() - days * 86400000).toISOString();

  const { data: events, error } = await supabase
    .from("analytics_events")
    .select(
      "created_at, event_type, link_id, country, region, city, device_type, os, browser, referrer, utm_source, utm_medium, utm_campaign",
    )
    .eq("profile_id", user.id)
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
    "region",
    "city",
    "device_type",
    "os",
    "browser",
    "referrer",
    "utm_source",
    "utm_medium",
    "utm_campaign",
  ];

  const lines = [headers.join(",")];
  for (const row of events ?? []) {
    lines.push(
      headers.map((h) => csvEscape((row as Record<string, string | null>)[h])).join(","),
    );
  }

  const csv = lines.join("\n");
  const filename = `taptag-analytics-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
