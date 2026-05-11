import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const COOLDOWN_MS = 60_000; // must match the client UI cooldown

// In-memory per-user cooldown map. Good enough for a single-server
// deployment + the 60s window we're enforcing. For multi-region you'd
// move this to a Redis/Upstash counter. Supabase's own auth gateway
// applies a separate (longer) cooldown server-side as a backstop, so
// even if this map is bypassed the user can't actually spam emails.
const lastSentAt = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    const auth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    );
    const {
      data: { user },
      error: authError,
    } = await auth.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Already verified — bail out cheaply instead of triggering an email.
    if ((user as any).email_confirmed_at || (user as any).confirmed_at) {
      return NextResponse.json({ alreadyVerified: true });
    }
    if (!user.email) {
      return NextResponse.json({ error: "No email on file" }, { status: 400 });
    }

    const now = Date.now();
    const last = lastSentAt.get(user.id) ?? 0;
    const wait = COOLDOWN_MS - (now - last);
    if (wait > 0) {
      return NextResponse.json(
        {
          error: "Please wait before requesting another verification email",
          retryAfterSeconds: Math.ceil(wait / 1000),
        },
        { status: 429 },
      );
    }

    // Anon client (this endpoint, not the user's session) — `resend` uses
    // the public anon flow rather than the service role.
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    );
    const { error: sendErr } = await anon.auth.resend({
      type: "signup",
      email: user.email,
    });
    if (sendErr) {
      return NextResponse.json({ error: sendErr.message }, { status: 400 });
    }

    lastSentAt.set(user.id, now);
    return NextResponse.json({
      success: true,
      retryAfterSeconds: COOLDOWN_MS / 1000,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
