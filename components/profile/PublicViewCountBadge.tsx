"use client";

import { useEffect, useState } from "react";

export default function PublicViewCountBadge({ username }: { username: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/profile/${encodeURIComponent(username)}/public-stats`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.enabled && typeof data.viewsThisWeek === "number") {
          setViews(data.viewsThisWeek);
        }
      })
      .catch(() => {});
  }, [username]);

  if (views === null) return null;

  return (
    <p
      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full mt-3"
      style={{
        backgroundColor: "color-mix(in srgb, var(--text) 12%, transparent)",
        color: "var(--text)",
      }}
    >
      <span aria-hidden>👀</span>
      <span>
        {views.toLocaleString()} view{views === 1 ? "" : "s"} this week
      </span>
    </p>
  );
}
