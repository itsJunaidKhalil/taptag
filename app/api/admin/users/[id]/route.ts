import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// User detail (admin only). Returns the profile row + auth metadata +
// link/analytics counts so the admin detail page can render without N
// additional client-side calls.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ctx = await requireAdmin(req);
  if ("error" in ctx) return ctx.error;
  const { admin } = ctx;

  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const [authRes, profileRes, linksRes, analyticsCountRes, reportsRes] =
    await Promise.all([
      admin.auth.admin.getUserById(id),
      admin.from("profiles").select("*").eq("id", id).maybeSingle(),
      admin
        .from("social_links")
        .select("id, platform, url, title, order_index, is_visible, is_featured")
        .eq("user_id", id)
        .order("order_index", { ascending: true }),
      admin
        .from("analytics")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", id),
      admin
        .from("reports")
        .select("id, reason, details, status, created_at, resolved_at")
        .eq("profile_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (authRes.error) {
    return NextResponse.json({ error: authRes.error.message }, { status: 500 });
  }
  const u = authRes.data?.user;
  if (!u) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      verified: !!((u as any).email_confirmed_at || (u as any).confirmed_at),
      provider: (u as any).app_metadata?.provider ?? null,
      providers: (u as any).app_metadata?.providers ?? [],
    },
    profile: profileRes.data ?? null,
    links: linksRes.data ?? [],
    analyticsCount: analyticsCountRes.count ?? 0,
    reportsAgainst: reportsRes.data ?? [],
  });
}
