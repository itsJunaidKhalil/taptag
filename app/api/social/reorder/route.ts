import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderedIds: string[] = Array.isArray(body?.orderedIds) ? body.orderedIds : [];

    if (orderedIds.length === 0) {
      return NextResponse.json({ error: "orderedIds is required" }, { status: 400 });
    }
    if (orderedIds.length > 200) {
      return NextResponse.json({ error: "Too many links" }, { status: 400 });
    }
    if (orderedIds.some((id) => typeof id !== "string" || id.length < 8)) {
      return NextResponse.json({ error: "Invalid id in orderedIds" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    );
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);
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

    // Verify every id belongs to the authenticated user before mutating
    const { data: ownedRows, error: ownerErr } = await admin
      .from("social_links")
      .select("id")
      .eq("user_id", user.id)
      .in("id", orderedIds);

    if (ownerErr) {
      return NextResponse.json({ error: ownerErr.message }, { status: 400 });
    }
    if (!ownedRows || ownedRows.length !== orderedIds.length) {
      return NextResponse.json(
        { error: "One or more links do not belong to this user" },
        { status: 403 },
      );
    }

    // Atomic reorder via SQL function (created by migration). Falls back to
    // sequential updates if the RPC isn't available yet.
    const { error: rpcErr } = await admin.rpc("reorder_social_links", {
      p_user_id: user.id,
      p_ordered_ids: orderedIds,
    });

    if (rpcErr) {
      // Fallback: per-row update (still atomic per row, just slower)
      const updates = orderedIds.map((id, idx) =>
        admin
          .from("social_links")
          .update({ order_index: idx })
          .eq("id", id)
          .eq("user_id", user.id),
      );
      const results = await Promise.all(updates);
      const firstErr = results.find((r) => r.error)?.error;
      if (firstErr) {
        return NextResponse.json({ error: firstErr.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, count: orderedIds.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
