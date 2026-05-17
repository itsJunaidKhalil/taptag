export type LinkClickRow = {
  link_id: string;
  created_at: string;
};

export type LinkWithStats = {
  id: string;
  platform: string;
  url: string;
  title: string | null;
  order_index: number;
  clicksThisWeek: number;
};

const WEEK_MS = 7 * 86400000;

export function aggregateLinkClicks(
  events: LinkClickRow[],
  sinceMs = Date.now() - WEEK_MS,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const e of events) {
    if (!e.link_id) continue;
    const t = new Date(e.created_at).getTime();
    if (isNaN(t) || t < sinceMs) continue;
    counts.set(e.link_id, (counts.get(e.link_id) ?? 0) + 1);
  }
  return counts;
}

export function mergeLinksWithClickCounts(
  links: {
    id: string;
    platform: string;
    url: string;
    title?: string | null;
    order_index: number;
  }[],
  clickCounts: Map<string, number>,
): LinkWithStats[] {
  return links
    .map((link) => ({
      ...link,
      title: link.title ?? null,
      clicksThisWeek: clickCounts.get(link.id) ?? 0,
    }))
    .sort((a, b) => b.clicksThisWeek - a.clicksThisWeek || a.order_index - b.order_index);
}
