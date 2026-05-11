import { supabase } from "@/lib/supabase";

// Tiny helper used by the /admin/* client pages to attach the bearer
// token to every API request. Throws a typed error so callers can
// `toast.error(e.message)` without unwrapping the response.
export async function adminFetch<T = any>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Not signed in");
  }
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${session.access_token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(input, { ...init, headers, cache: "no-store" });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => ({})) : await res.text();
  if (!res.ok) {
    const message =
      (typeof payload === "object" && (payload as any).error) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return payload as T;
}

// Variant that returns the raw Response — useful for CSV downloads
// where we want the blob and the filename out of Content-Disposition.
export async function adminFetchRaw(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Not signed in");
  }
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${session.access_token}`);
  const res = await fetch(input, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {}
    throw new Error(message);
  }
  return res;
}
