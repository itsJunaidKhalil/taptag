import { z } from "zod";
import { ANALYTICS_EVENT_TYPES, ANALYTICS_PLATFORMS } from "./constants";

export const analyticsIngestSchema = z.object({
  profile_id: z.string().uuid(),
  event_type: z.enum(ANALYTICS_EVENT_TYPES),
  link_id: z.string().uuid().optional(),
  platform: z.enum(ANALYTICS_PLATFORMS).optional(),
  referrer: z.string().max(2048).optional(),
  session_id: z.string().max(128).optional(),
  visitor_id: z.string().max(128).optional(),
  utm_source: z.string().max(256).optional(),
  utm_medium: z.string().max(256).optional(),
  utm_campaign: z.string().max(256).optional(),
});

export type AnalyticsIngestPayload = z.infer<typeof analyticsIngestSchema>;
