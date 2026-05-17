/** Skip profile_view inserts for common preview/crawler user agents. */
export function isLikelyBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegrambot|discordbot|linkedinbot|twitterbot|slackbot|embedly|googlebot|bingbot|applebot|headlesschrome|phantomjs/i.test(
    userAgent,
  );
}
