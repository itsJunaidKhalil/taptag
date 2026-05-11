import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

// Lightweight check used by the client-side admin guard to decide whether
// to render the admin layout or redirect to /dashboard. Returns 200 +
// { admin: true } when the caller is an admin, 401/403 otherwise.
export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if ("error" in ctx) return ctx.error;
  return NextResponse.json({ admin: true, userId: ctx.user.id });
}
