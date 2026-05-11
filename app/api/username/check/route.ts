import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

const RESERVED = new Set([
  "admin", "api", "auth", "dashboard", "login", "logout", "signup",
  "register", "settings", "privacy", "terms", "support", "help",
  "about", "contact", "blog", "pricing", "home", "www", "mail",
  "ftp", "root", "user", "users", "profile", "profiles", "card",
  "cards", "taptag", "tap", "tag", "static", "public", "assets",
  "favicon", "robots", "sitemap", "_next", "404", "500",
]);

const VALID = /^[a-z0-9_-]{3,30}$/;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const raw = (url.searchParams.get("username") || "").toLowerCase().trim();

  if (!raw) {
    return NextResponse.json({ available: false, reason: "Username is required" });
  }
  if (!VALID.test(raw)) {
    return NextResponse.json({
      available: false,
      reason: "3–30 chars, only letters, numbers, _ and -",
    });
  }
  if (RESERVED.has(raw)) {
    return NextResponse.json({
      available: false,
      reason: "That username is reserved",
      suggestions: [`${raw}1`, `${raw}_`, `the${raw}`].slice(0, 3),
    });
  }

  try {
    const supabase = createServerClient();
    const [profileRes, redirectRes] = await Promise.all([
      supabase.from("profiles").select("id").eq("username", raw).maybeSingle(),
      supabase.from("username_redirects").select("old_username").eq("old_username", raw).maybeSingle(),
    ]);

    const taken = !!profileRes.data || !!redirectRes.data;
    if (taken) {
      return NextResponse.json({
        available: false,
        reason: "That username is already taken",
        suggestions: [`${raw}1`, `${raw}_`, `the${raw}`],
      });
    }
    return NextResponse.json({ available: true });
  } catch (e: any) {
    return NextResponse.json({ available: false, reason: "Could not check availability" }, { status: 500 });
  }
}
