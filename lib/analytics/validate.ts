import { z } from "zod";
import { ANALYTICS_EVENT_TYPES, ANALYTICS_PLATFORMS } from "./constants";

export const analyticsIngestSchema = z.object({
  profile_id: z.string().uuid(),
  event_type: z.enum(ANALYTICS_EVENT_TYPES),
  platform: z.enum(ANALYTICS_PLATFORMS).optional(),
  referrer: z.string().max(2048).optional(),
});

export type AnalyticsIngestPayload = z.infer<typeof analyticsIngestSchema>;
