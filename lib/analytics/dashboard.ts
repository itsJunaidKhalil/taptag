export const ANALYTICS_DASHBOARD_DAYS = 7;

export type DailyRow = {
  date: string;
  views: number;
  unique_visitors: number;
  link_clicks: number;
  link_shares: number;
  vcf_downloads: number;
  contact_saves: number;
  mobile_views: number;
  desktop_views: number;
};

export type ActivityRow = {
  id: string;
  event_type: string;
  device_type: string | null;
  platform: string | null;
  referrer: string | null;
  timestamp: string;
};

export function dateKeyUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Build last N UTC day keys ending today. */
export function lastNDaysKeys(days: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    keys.push(dateKeyUtc(d));
  }
  return keys;
}

export function buildSeriesFromDaily(
  daily: DailyRow[],
  days: number,
  pick: (row: DailyRow) => number,
): number[] {
  const map = new Map(daily.map((r) => [r.date, r]));
  return lastNDaysKeys(days).map((key) => {
    const row = map.get(key);
    return row ? pick(row) : 0;
  });
}

export function buildTrendChartData(daily: DailyRow[], days: number): { label: string; views: number; clicks: number }[] {
  const map = new Map(daily.map((r) => [r.date, r]));
  return lastNDaysKeys(days).map((key) => {
    const row = map.get(key);
    const d = new Date(`${key}T12:00:00Z`);
    return {
      label: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
      views: row?.views ?? 0,
      clicks: row?.link_clicks ?? 0,
    };
  });
}

export function sumDaily(daily: DailyRow[], pick: (row: DailyRow) => number): number {
  return daily.reduce((acc, row) => acc + pick(row), 0);
}

export function mapEventToActivity(row: {
  id: number | string;
  event_type: string;
  device_type?: string | null;
  referrer?: string | null;
  created_at: string;
}): ActivityRow {
  const device = row.device_type ?? null;
  const platform =
    device === "mobile" || device === "tablet"
      ? "mobile"
      : device === "desktop"
        ? "desktop"
        : null;
  return {
    id: String(row.id),
    event_type: row.event_type,
    device_type: device,
    platform,
    referrer: row.referrer ?? null,
    timestamp: row.created_at,
  };
}

export function mapLegacyToActivity(row: {
  id: number | string;
  event_type: string;
  platform?: string | null;
  referrer?: string | null;
  timestamp: string;
}): ActivityRow {
  return {
    id: String(row.id),
    event_type: row.event_type,
    device_type: null,
    platform: row.platform ?? null,
    referrer: row.referrer ?? null,
    timestamp: row.timestamp,
  };
}
