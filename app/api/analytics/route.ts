import { NextRequest, NextResponse } from "next/server";
import { isLikelyBotUserAgent } from "@/lib/analytics/bot-filter";
import {
  assertAnalyticsRateLimits,
  shouldRecordProfileView,
} from "@/lib/analytics/rate-limit";
import { getGeoFromRequest, parseDeviceFromUserAgent } from "@/lib/analytics/request-meta";
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

    const {
      profile_id,
      event_type,
      link_id,
      platform,
      referrer,
      session_id,
      visitor_id,
      utm_source,
      utm_medium,
      utm_campaign,
    } = parsed.data;

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

    const ua = req.headers.get("user-agent");
    const isBot = isLikelyBotUserAgent(ua);

    if (event_type === "profile_view") {
      if (isBot) {
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

    if (link_id) {
      const { data: link, error: linkError } = await supabase
        .from("social_links")
        .select("id")
        .eq("id", link_id)
        .eq("user_id", profile_id)
        .maybeSingle();
      if (linkError) {
        return NextResponse.json({ error: linkError.message }, { status: 500 });
      }
      if (!link) {
        return NextResponse.json({ error: "Invalid link_id" }, { status: 400 });
      }
    }

    const geo = getGeoFromRequest(req);
    const device = parseDeviceFromUserAgent(ua, platform);

    const legacyPlatform =
      device.device_type === "tablet" ? "mobile" : device.device_type;

    const eventRow = {
      profile_id,
      link_id: link_id ?? null,
      event_type,
      session_id: session_id ?? null,
      visitor_id: visitor_id ?? null,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      device_type: device.device_type,
      os: device.os,
      browser: device.browser,
      referrer: referrer ?? null,
      utm_source: utm_source ?? null,
      utm_medium: utm_medium ?? null,
      utm_campaign: utm_campaign ?? null,
      is_bot: isBot,
    };

    const { error: eventsError } = await supabase.from("analytics_events").insert(eventRow);
    const eventsTableMissing =
      eventsError &&
      (eventsError.message.includes("does not exist") ||
        eventsError.code === "42P01" ||
        eventsError.code === "PGRST205");

    if (eventsError && !eventsTableMissing) {
      return NextResponse.json({ error: eventsError.message }, { status: 400 });
    }

    const { error: legacyError } = await supabase.from("analytics").insert({
      profile_id,
      event_type,
      platform: legacyPlatform,
      referrer: referrer ?? null,
    });

    if (legacyError) {
      return NextResponse.json({ error: legacyError.message }, { status: 400 });
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
