// vCard 3.0 export.
//
// iOS Contacts requires a properly-formed structured-name (`N:`) field. When
// it's missing iOS falls back to displaying `ORG`, which is why earlier
// versions of this file showed the company instead of the person's name on
// iPhones (Android was more forgiving and used `FN`).
//
// We now emit:
//   - N:Family;Given;Additional;Prefix;Suffix      (required for iOS)
//   - FN:Full Name                                  (display name everywhere)
//   - ORG / TITLE split from the user's "company / role" field when it's in
//     a "Title at Company" shape
//   - One URL line for the website plus one for the public TapTag profile

export function generateVCF(profile: {
  full_name: string | null;
  company: string | null;
  phone: string | null;
  email: string | null;
  username: string;
  website?: string | null;
}) {
  const fullName = (profile.full_name || profile.username || "").trim();
  const { family, given, additional } = splitName(fullName);

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escape(family)};${escape(given)};${escape(additional)};;`,
    `FN:${escape(fullName)}`,
  ];

  if (profile.username) {
    lines.push(`NICKNAME:${escape(profile.username)}`);
  }

  // The single "company" field on TapTag is actually used by most users for a
  // composite "Title at Company" string. Detect that pattern and split into
  // proper TITLE + ORG so iOS shows them separately. If the value doesn't
  // contain " at " we treat it all as ORG.
  if (profile.company) {
    const company = profile.company.trim();
    const match = company.match(/^(.+?)\s+at\s+(.+)$/i);
    if (match) {
      lines.push(`TITLE:${escape(match[1].trim())}`);
      lines.push(`ORG:${escape(match[2].trim())}`);
    } else {
      lines.push(`ORG:${escape(company)}`);
    }
  }

  if (profile.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${escape(profile.phone)}`);
  }

  if (profile.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${escape(profile.email)}`);
  }

  if (profile.website) {
    lines.push(`URL:${escape(profile.website)}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://taptag.biz";
  if (profile.username) {
    lines.push(`URL;TYPE=TapTag:${escape(baseUrl)}/${escape(profile.username)}`);
  }

  // Marks this card as belonging to a person rather than an organization,
  // which is another hint iOS uses to pick the correct display field.
  lines.push("KIND:individual");
  lines.push(`REV:${new Date().toISOString()}`);
  lines.push("END:VCARD");

  return lines.join("\r\n");
}

function splitName(full: string): {
  family: string;
  given: string;
  additional: string;
} {
  if (!full) return { family: "", given: "", additional: "" };
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { family: "", given: "", additional: "" };
  if (parts.length === 1) return { family: "", given: parts[0], additional: "" };
  const family = parts[parts.length - 1];
  const given = parts[0];
  const additional = parts.slice(1, -1).join(" ");
  return { family, given, additional };
}

function escape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
