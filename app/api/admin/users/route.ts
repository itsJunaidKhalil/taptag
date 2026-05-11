import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const MAX_PAGE_SIZE = 100;

type Status = "active" | "unverified" | "deleted" | "all";

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if ("error" in ctx) return ctx.error;
  const { admin } = ctx;

  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim().toLowerCase();
  const status = ((sp.get("status") || "all") as Status) ?? "all";
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(sp.get("pageSize") || "25", 10)),
  );
  const format = sp.get("format"); // "csv" -> stream all rows as CSV

  // Pull a generous slice of auth users and filter/sort in-memory. For
  // the early-product scale (≤10k users) this is faster + simpler than
  // building a server-side view that joins auth.users with profiles.
  const { data: authData, error: authErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 10000,
  });
  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 500 });
  }
  const authUsers = authData?.users ?? [];

  const { data: profiles, error: profilesErr } = await admin
    .from("profiles")
    .select(
      "id, username, full_name, company, role, onboarding_completed_at, deleted_at, scheduled_deletion_at, created_at",
    );
  if (profilesErr) {
    return NextResponse.json({ error: profilesErr.message }, { status: 500 });
  }
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  type Row = {
    id: string;
    email: string | null;
    username: string | null;
    full_name: string | null;
    company: string | null;
    role: string;
    verified: boolean;
    onboarded: boolean;
    deleted_at: string | null;
    scheduled_deletion_at: string | null;
    created_at: string;
    last_sign_in_at: string | null;
    provider: string | null;
  };

  let rows: Row[] = authUsers.map((u: any) => {
    const p = profileById.get(u.id) as any;
    return {
      id: u.id,
      email: u.email ?? null,
      username: p?.username ?? null,
      full_name: p?.full_name ?? null,
      company: p?.company ?? null,
      role: p?.role ?? "user",
      verified: !!(u.email_confirmed_at || u.confirmed_at),
      onboarded: !!p?.onboarding_completed_at,
      deleted_at: p?.deleted_at ?? null,
      scheduled_deletion_at: p?.scheduled_deletion_at ?? null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      provider: u.app_metadata?.provider ?? null,
    };
  });

  if (q) {
    rows = rows.filter((r) => {
      const hay = [r.email, r.username, r.full_name, r.company]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  if (status === "active") {
    rows = rows.filter((r) => !r.deleted_at);
  } else if (status === "unverified") {
    rows = rows.filter((r) => !r.verified && !r.deleted_at);
  } else if (status === "deleted") {
    rows = rows.filter((r) => !!r.deleted_at);
  }

  rows.sort((a, b) =>
    (b.created_at || "").localeCompare(a.created_at || ""),
  );

  if (format === "csv") {
    const header = [
      "id",
      "email",
      "username",
      "full_name",
      "company",
      "role",
      "verified",
      "onboarded",
      "deleted_at",
      "created_at",
      "last_sign_in_at",
      "provider",
    ];
    const escape = (v: any) => {
      if (v === null || v === undefined) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        header.map((h) => escape((r as any)[h])).join(","),
      ),
    ];
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="taptag-users-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const slice = rows.slice(start, start + pageSize);

  return NextResponse.json({
    rows: slice,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}
