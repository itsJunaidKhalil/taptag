import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-service";

export const dynamic = "force-dynamic";

const WEEK_DAYS = 7;

/** Public aggregate stats when the profile owner opted in. */
export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } },
) {
  try {
    const username = params.username?.trim().toLowerCase();
    if (!username) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, show_public_view_count")
      .eq("username", username)
      .is("deleted_at", null)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
    if (!profile) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!profile.show_public_view_count) {
      return NextResponse.json({ enabled: false });
    }

    const sinceDate = new Date(Date.now() - WEEK_DAYS * 86400000)
      .toISOString()
      .slice(0, 10);

    const { data: daily, error: dailyError } = await supabase
      .from("analytics_daily")
      .select("views")
      .eq("profile_id", profile.id)
      .gte("date", sinceDate);

    if (dailyError) {
      return NextResponse.json({ error: dailyError.message }, { status: 500 });
    }

    const viewsThisWeek = (daily ?? []).reduce((sum, row) => sum + (row.views ?? 0), 0);

    return NextResponse.json({
      enabled: true,
      viewsThisWeek,
      periodDays: WEEK_DAYS,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
