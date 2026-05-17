import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  aggregateLinkClicks,
  mergeLinksWithClickCounts,
} from "@/lib/analytics/link-stats";

export const dynamic = "force-dynamic";

const WEEK_MS = 7 * 86400000;

export async function GET(req: NextRequest) {
  try {
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

    const sinceIso = new Date(Date.now() - WEEK_MS).toISOString();

    const [linksRes, eventsRes] = await Promise.all([
      supabase
        .from("social_links")
        .select("id, platform, url, title, order_index")
        .eq("user_id", user.id)
        .order("order_index", { ascending: true }),
      supabase
        .from("analytics_events")
        .select("link_id, created_at")
        .eq("profile_id", user.id)
        .eq("event_type", "link_click")
        .not("link_id", "is", null)
        .gte("created_at", sinceIso),
    ]);

    if (linksRes.error) {
      return NextResponse.json({ error: linksRes.error.message }, { status: 500 });
    }

    const links = linksRes.data ?? [];
    let clickCounts = new Map<string, number>();

    if (!eventsRes.error && eventsRes.data) {
      clickCounts = aggregateLinkClicks(eventsRes.data as { link_id: string; created_at: string }[]);
    }

    const linksWithStats = mergeLinksWithClickCounts(links, clickCounts);
    const totalClicks = linksWithStats.reduce((s, l) => s + l.clicksThisWeek, 0);

    return NextResponse.json({
      links: linksWithStats,
      totalClicksThisWeek: totalClicks,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
