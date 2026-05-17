import { NextRequest, NextResponse } from "next/server";
import {
  buildDigestHtml,
  fetchWeeklyDigestRecipients,
  sendDigestEmail,
} from "@/lib/email/weekly-digest";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
    }

    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured — skipping digest" },
        { status: 503 },
      );
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://taptag.biz").replace(/\/+$/, "");
    const recipients = await fetchWeeklyDigestRecipients();

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const r of recipients) {
      const html = buildDigestHtml(r, appUrl);
      const subject = `Your TapTag week: ${r.views} views, ${r.clicks} clicks`;
      const result = await sendDigestEmail(r.email, subject, html);
      if (result.ok) sent += 1;
      else {
        failed += 1;
        if (errors.length < 5) errors.push(`${r.email}: ${result.error}`);
      }
    }

    return NextResponse.json({
      success: true,
      recipients: recipients.length,
      sent,
      failed,
      errors: errors.length ? errors : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
