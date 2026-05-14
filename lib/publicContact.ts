/** Email shown on the public profile, vCard, and digital card (not the login email). */
export function publicContactEmail(profile: {
  contact_email?: string | null;
  email?: string | null;
}): string | null {
  const c = profile.contact_email?.trim();
  if (c) return c;
  const e = profile.email?.trim();
  return e || null;
}
