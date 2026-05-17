import { NextRequest, NextResponse } from "next/server";
import { isLikelyBotUserAgent } from "@/lib/analytics/bot-filter";
import {
  assertAnalyticsRateLimits,
  shouldRecordProfileView,
} from "@/lib/analytics/rate-limit";
import { analyticsIngestSchema } from "@/lib/analytics/validate";
import { createServiceClient } from "@/lib/supabase-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = analyticsIngestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { profile_id, event_type, platform, referrer } = parsed.data;

    const rate = await assertAnalyticsRateLimits(req);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many requests", retryAfterSeconds: rate.retryAfterSeconds },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSeconds) },
        },
      );
    }

    if (event_type === "profile_view") {
      const ua = req.headers.get("user-agent");
      if (isLikelyBotUserAgent(ua)) {
        return NextResponse.json({ success: true, skipped: "bot" });
      }
      const record = await shouldRecordProfileView(req, profile_id);
      if (!record) {
        return NextResponse.json({ success: true, skipped: "deduped" });
      }
    }

    const supabase = createServiceClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", profile_id)
      .is("deleted_at", null)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { error } = await supabase.from("analytics").insert({
      profile_id,
      event_type,
      platform: platform ?? null,
      referrer: referrer ?? null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
