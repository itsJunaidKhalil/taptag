import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * GET /api/account/export
 *
 * Returns a JSON file containing every row in the database directly
 * associated with the authenticated user. Used to satisfy GDPR Article
 * 20 (right to data portability).
 *
 * Auth: Bearer token in `Authorization` header.
 */
export async function GET(req: NextRequest) {
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

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Server is missing SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 },
      );
    }
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [profileRes, socialLinksRes, analyticsRes, redirectsRes] =
      await Promise.all([
        admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        admin.from("social_links").select("*").eq("user_id", user.id),
        admin
          .from("analytics")
          .select("*")
          .eq("profile_id", user.id)
          .order("timestamp", { ascending: false })
          .limit(5000),
        admin.from("username_redirects").select("*").eq("user_id", user.id),
      ]);

    const payload = {
      schema: "taptag/account-export/v1",
      exported_at: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at ?? null,
        provider: user.app_metadata?.provider ?? null,
      },
      profile: profileRes.data ?? null,
      social_links: socialLinksRes.data ?? [],
      analytics: analyticsRes.data ?? [],
      username_redirects: redirectsRes.data ?? [],
      notes: [
        "This file contains all personal data TapTag stores about your account.",
        "Analytics rows are capped at the 5,000 most-recent events.",
      ],
    };

    const username = (profileRes.data as any)?.username || "account";
    const filename = `taptag-export-${username}-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
