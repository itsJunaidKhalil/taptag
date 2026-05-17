import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-service";

export const dynamic = "force-dynamic";

/**
 * Rolls up analytics_events → analytics_daily for recent UTC days.
 * Secure with CRON_SECRET (Vercel Cron sends Authorization: Bearer <secret>).
 */
export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "CRON_SECRET is not configured" },
        { status: 500 },
      );
    }

    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const days = Math.min(
      31,
      Math.max(1, Number(req.nextUrl.searchParams.get("days") ?? "8")),
    );

    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc("rollup_analytics_daily_range", {
      p_days: days,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rowsAffected: data ?? 0, days });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
