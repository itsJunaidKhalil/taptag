export type BreakdownRow = { label: string; count: number };

export function aggregateLabelCounts(
  rows: { label: string | null }[],
  labeler: (raw: string | null) => string,
  limit = 8,
): BreakdownRow[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const label = labeler(r.label);
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function formatReferrerLabel(referrer: string | null): string {
  if (!referrer || referrer === "direct") return "Direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.length > 40 ? `${referrer.slice(0, 37)}…` : referrer;
  }
}

export function formatUtmLabel(
  source: string | null,
  medium: string | null,
  campaign: string | null,
): string {
  const parts = [source, medium, campaign].filter(Boolean);
  return parts.length ? parts.join(" / ") : "—";
}
