import { NextRequest } from "next/server";

export type GeoHeaders = {
  country: string | null;
  region: string | null;
  city: string | null;
};

export function getGeoFromRequest(req: NextRequest): GeoHeaders {
  return {
    country: req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry"),
    region:
      req.headers.get("x-vercel-ip-country-region") ??
      req.headers.get("x-vercel-ip-region"),
    city: req.headers.get("x-vercel-ip-city"),
  };
}

export type DeviceMeta = {
  device_type: "mobile" | "tablet" | "desktop";
  os: string | null;
  browser: string | null;
};

export function parseDeviceFromUserAgent(
  ua: string | null,
  platformHint?: "mobile" | "desktop" | "tablet",
): DeviceMeta {
  if (!ua) {
    return {
      device_type: platformHint === "mobile" || platformHint === "tablet" ? platformHint : "desktop",
      os: null,
      browser: null,
    };
  }

  const isTablet = /iPad|Tablet|PlayBook|Silk/i.test(ua);
  const isMobile = /Mobile|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  let device_type: DeviceMeta["device_type"] = "desktop";
  if (platformHint === "tablet" || isTablet) device_type = "tablet";
  else if (platformHint === "mobile" || isMobile) device_type = "mobile";

  let os: string | null = null;
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser: string | null = null;
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Edg/i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";

  return { device_type, os, browser };
}
