export type FunnelStep = {
  key: string;
  label: string;
  count: number;
  rateFromPrevious: number | null;
};

export function buildFunnelFromTotals(totals: {
  views: number;
  link_clicks: number;
  vcf_downloads: number;
  contact_saves?: number;
}): FunnelStep[] {
  const views = totals.views;
  const clicks = totals.link_clicks;
  const vcf = totals.vcf_downloads;
  const saves = totals.contact_saves ?? 0;

  const rate = (num: number, denom: number) =>
    denom > 0 ? Math.round((num / denom) * 1000) / 10 : null;

  return [
    { key: "views", label: "Profile views", count: views, rateFromPrevious: null },
    {
      key: "clicks",
      label: "Link clicks",
      count: clicks,
      rateFromPrevious: rate(clicks, views),
    },
    {
      key: "vcf",
      label: "Save to contacts (VCF)",
      count: vcf,
      rateFromPrevious: rate(vcf, views),
    },
    {
      key: "contact_saves",
      label: "Contact actions",
      count: saves,
      rateFromPrevious: rate(saves, views),
    },
  ];
}
