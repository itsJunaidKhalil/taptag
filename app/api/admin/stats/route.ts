import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const DAY = 86400_000;

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if ("error" in ctx) return ctx.error;
  const { admin } = ctx;

  const now = Date.now();
  const since7d = new Date(now - 7 * DAY).toISOString();
  const since30d = new Date(now - 30 * DAY).toISOString();

  // Authoritative user counts come from auth.users. profiles is the
  // application-level mirror but a freshly-signed-up user may not have a
  // row yet. We list at most 10k users — fine for an early product.
  const { data: authUsersData } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 10000,
  });
  const users = authUsersData?.users ?? [];

  const totalUsers = users.length;
  const verifiedUsers = users.filter(
    (u) => (u as any).email_confirmed_at || (u as any).confirmed_at,
  ).length;
  const active7d = users.filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at).getTime() >= now - 7 * DAY,
  ).length;
  const active30d = users.filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at).getTime() >= now - 30 * DAY,
  ).length;
  const signups7d = users.filter(
    (u) => new Date(u.created_at).getTime() >= now - 7 * DAY,
  ).length;

  // 7-day signup sparkline (oldest -> newest).
  const signupBuckets: number[] = Array(7).fill(0);
  for (const u of users) {
    const created = new Date(u.created_at).getTime();
    const diff = Math.floor((now - created) / DAY);
    if (diff >= 0 && diff < 7) signupBuckets[6 - diff] += 1;
  }

  const [
    softDeletedRes,
    reportsOpenRes,
    reportsResolvedRes,
    profilesCountRes,
    onboardedRes,
    recentReportsRes,
    recentSignupsRes,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .not("deleted_at", "is", null),
    admin
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    admin
      .from("reports")
      .select("id", { count: "exact", head: true })
      .in("status", ["resolved", "dismissed"]),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .not("onboarding_completed_at", "is", null),
    admin
      .from("reports")
      .select("id, reported_username, reason, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("profiles")
      .select("id, username, full_name, created_at")
      .gte("created_at", since30d)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return NextResponse.json({
    users: {
      total: totalUsers,
      verified: verifiedUsers,
      active7d,
      active30d,
      signups7d,
      signups7dSeries: signupBuckets,
      profilesWithRow: profilesCountRes.count ?? 0,
      onboarded: onboardedRes.count ?? 0,
      softDeleted: softDeletedRes.count ?? 0,
    },
    reports: {
      open: reportsOpenRes.count ?? 0,
      resolved: reportsResolvedRes.count ?? 0,
    },
    // Placeholder while billing (Stripe) is unwired. Replaced in PR #6.
    revenue: {
      mrrCents: 0,
      paidUsers: 0,
      placeholder: true,
    },
    recent: {
      signups: recentSignupsRes.data ?? [],
      reports: recentReportsRes.data ?? [],
    },
    since: { d7: since7d, d30: since30d },
  });
}
