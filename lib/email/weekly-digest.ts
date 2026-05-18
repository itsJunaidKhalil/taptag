import { createServiceClient } from "@/lib/supabase-service";

const WEEK_DAYS = 7;

export type DigestRecipient = {
  email: string;
  username: string | null;
  views: number;
  clicks: number;
  topLinkLabel: string | null;
  topLinkClicks: number;
};

export async function fetchWeeklyDigestRecipients(): Promise<DigestRecipient[]> {
  const supabase = createServiceClient();
  const sinceDate = new Date(Date.now() - WEEK_DAYS * 86400000).toISOString().slice(0, 10);

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, username")
    .is("deleted_at", null)
    .not("email", "is", null)
    .eq("weekly_digest_enabled", true);

  if (error || !profiles?.length) return [];

  const recipients: DigestRecipient[] = [];

  for (const p of profiles) {
    if (!p.email) continue;

    const { data: daily } = await supabase
      .from("analytics_daily")
      .select("views, link_clicks")
      .eq("profile_id", p.id)
      .gte("date", sinceDate);

    const views = (daily ?? []).reduce((s, r) => s + (r.views ?? 0), 0);
    const clicks = (daily ?? []).reduce((s, r) => s + (r.link_clicks ?? 0), 0);

    if (views === 0 && clicks === 0) continue;

    const sinceIso = new Date(Date.now() - WEEK_DAYS * 86400000).toISOString();
    const { data: linkEvents } = await supabase
      .from("analytics_events")
      .select("link_id")
      .eq("profile_id", p.id)
      .eq("event_type", "link_click")
      .not("link_id", "is", null)
      .gte("created_at", sinceIso);

    let topLinkLabel: string | null = null;
    let topLinkClicks = 0;

    if (linkEvents?.length) {
      const counts = new Map<string, number>();
      for (const e of linkEvents) {
        if (!e.link_id) continue;
        counts.set(e.link_id, (counts.get(e.link_id) ?? 0) + 1);
      }
      let topId: string | null = null;
      counts.forEach((c, id) => {
        if (c > topLinkClicks) {
          topLinkClicks = c;
          topId = id;
        }
      });
      if (topId) {
        const { data: link } = await supabase
          .from("social_links")
          .select("platform, title")
          .eq("id", topId)
          .maybeSingle();
        topLinkLabel = link?.title || link?.platform || "your top link";
      }
    }

    recipients.push({
      email: p.email,
      username: p.username,
      views,
      clicks,
      topLinkLabel,
      topLinkClicks,
    });
  }

  return recipients;
}

export function buildDigestHtml(r: DigestRecipient, appUrl: string): string {
  const profilePath = r.username ? `/${r.username}` : "/dashboard";
  const topLine =
    r.topLinkLabel && r.topLinkClicks > 0
      ? `<p>Top link: <strong>${r.topLinkLabel}</strong> (${r.topLinkClicks} clicks)</p>`
      : "";

  return `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
      <h1 style="font-size:20px">Your TapTag week in review</h1>
      <p>Your card was viewed <strong>${r.views}</strong> time${r.views === 1 ? "" : "s"} and received <strong>${r.clicks}</strong> link click${r.clicks === 1 ? "" : "s"} in the last 7 days.</p>
      ${topLine}
      <p><a href="${appUrl}/dashboard/analytics">View full analytics</a> · <a href="${appUrl}${profilePath}">View your card</a></p>
      <p style="font-size:12px;color:#666">Turn off weekly emails in Account Settings → Analytics. Reply to privacy@taptag.biz for other requests.</p>
    </div>
  `;
}

export async function sendDigestEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "TapTag <noreply@taptag.biz>";
  if (!key) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: body || res.statusText };
  }
  return { ok: true };
}
