export interface DialCountry {
  iso: string;
  name: string;
  dialCode: string;
}

/** ISO 3166-1 alpha-2 → regional indicator flag emoji */
export function isoToFlagEmoji(iso: string): string {
  const code = iso.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "\u2753";
  return String.fromCodePoint(...code.split("").map((c) => 127397 + c.charCodeAt(0)));
}

/**
 * Sorted alphabetically by country name for dropdowns.
 * Dial codes without "+" (e.g. "1", "44", "92").
 */
export const WHATSAPP_DIAL_COUNTRIES: DialCountry[] = [
  { iso: "AF", name: "Afghanistan", dialCode: "93" },
  { iso: "AL", name: "Albania", dialCode: "355" },
  { iso: "DZ", name: "Algeria", dialCode: "213" },
  { iso: "AD", name: "Andorra", dialCode: "376" },
  { iso: "AO", name: "Angola", dialCode: "244" },
  { iso: "AR", name: "Argentina", dialCode: "54" },
  { iso: "AM", name: "Armenia", dialCode: "374" },
  { iso: "AU", name: "Australia", dialCode: "61" },
  { iso: "AT", name: "Austria", dialCode: "43" },
  { iso: "AZ", name: "Azerbaijan", dialCode: "994" },
  { iso: "BH", name: "Bahrain", dialCode: "973" },
  { iso: "BD", name: "Bangladesh", dialCode: "880" },
  { iso: "BY", name: "Belarus", dialCode: "375" },
  { iso: "BE", name: "Belgium", dialCode: "32" },
  { iso: "BZ", name: "Belize", dialCode: "501" },
  { iso: "BJ", name: "Benin", dialCode: "229" },
  { iso: "BT", name: "Bhutan", dialCode: "975" },
  { iso: "BO", name: "Bolivia", dialCode: "591" },
  { iso: "BA", name: "Bosnia and Herzegovina", dialCode: "387" },
  { iso: "BW", name: "Botswana", dialCode: "267" },
  { iso: "BR", name: "Brazil", dialCode: "55" },
  { iso: "BN", name: "Brunei", dialCode: "673" },
  { iso: "BG", name: "Bulgaria", dialCode: "359" },
  { iso: "KH", name: "Cambodia", dialCode: "855" },
  { iso: "CM", name: "Cameroon", dialCode: "237" },
  { iso: "CA", name: "Canada", dialCode: "1" },
  { iso: "CL", name: "Chile", dialCode: "56" },
  { iso: "CN", name: "China", dialCode: "86" },
  { iso: "CO", name: "Colombia", dialCode: "57" },
  { iso: "CR", name: "Costa Rica", dialCode: "506" },
  { iso: "HR", name: "Croatia", dialCode: "385" },
  { iso: "CY", name: "Cyprus", dialCode: "357" },
  { iso: "CZ", name: "Czech Republic", dialCode: "420" },
  { iso: "DK", name: "Denmark", dialCode: "45" },
  { iso: "DO", name: "Dominican Republic", dialCode: "1" },
  { iso: "EC", name: "Ecuador", dialCode: "593" },
  { iso: "EG", name: "Egypt", dialCode: "20" },
  { iso: "SV", name: "El Salvador", dialCode: "503" },
  { iso: "EE", name: "Estonia", dialCode: "372" },
  { iso: "ET", name: "Ethiopia", dialCode: "251" },
  { iso: "FI", name: "Finland", dialCode: "358" },
  { iso: "FR", name: "France", dialCode: "33" },
  { iso: "DE", name: "Germany", dialCode: "49" },
  { iso: "GH", name: "Ghana", dialCode: "233" },
  { iso: "GR", name: "Greece", dialCode: "30" },
  { iso: "GT", name: "Guatemala", dialCode: "502" },
  { iso: "HN", name: "Honduras", dialCode: "504" },
  { iso: "HK", name: "Hong Kong", dialCode: "852" },
  { iso: "HU", name: "Hungary", dialCode: "36" },
  { iso: "IS", name: "Iceland", dialCode: "354" },
  { iso: "IN", name: "India", dialCode: "91" },
  { iso: "ID", name: "Indonesia", dialCode: "62" },
  { iso: "IR", name: "Iran", dialCode: "98" },
  { iso: "IQ", name: "Iraq", dialCode: "964" },
  { iso: "IE", name: "Ireland", dialCode: "353" },
  { iso: "IL", name: "Israel", dialCode: "972" },
  { iso: "IT", name: "Italy", dialCode: "39" },
  { iso: "JM", name: "Jamaica", dialCode: "1" },
  { iso: "JP", name: "Japan", dialCode: "81" },
  { iso: "JO", name: "Jordan", dialCode: "962" },
  { iso: "KZ", name: "Kazakhstan", dialCode: "7" },
  { iso: "KE", name: "Kenya", dialCode: "254" },
  { iso: "KW", name: "Kuwait", dialCode: "965" },
  { iso: "LV", name: "Latvia", dialCode: "371" },
  { iso: "LB", name: "Lebanon", dialCode: "961" },
  { iso: "LY", name: "Libya", dialCode: "218" },
  { iso: "LT", name: "Lithuania", dialCode: "370" },
  { iso: "LU", name: "Luxembourg", dialCode: "352" },
  { iso: "MO", name: "Macau", dialCode: "853" },
  { iso: "MY", name: "Malaysia", dialCode: "60" },
  { iso: "MV", name: "Maldives", dialCode: "960" },
  { iso: "MT", name: "Malta", dialCode: "356" },
  { iso: "MX", name: "Mexico", dialCode: "52" },
  { iso: "MD", name: "Moldova", dialCode: "373" },
  { iso: "MC", name: "Monaco", dialCode: "377" },
  { iso: "MN", name: "Mongolia", dialCode: "976" },
  { iso: "ME", name: "Montenegro", dialCode: "382" },
  { iso: "MA", name: "Morocco", dialCode: "212" },
  { iso: "MZ", name: "Mozambique", dialCode: "258" },
  { iso: "MM", name: "Myanmar", dialCode: "95" },
  { iso: "NP", name: "Nepal", dialCode: "977" },
  { iso: "NL", name: "Netherlands", dialCode: "31" },
  { iso: "NZ", name: "New Zealand", dialCode: "64" },
  { iso: "NI", name: "Nicaragua", dialCode: "505" },
  { iso: "NG", name: "Nigeria", dialCode: "234" },
  { iso: "MK", name: "North Macedonia", dialCode: "389" },
  { iso: "NO", name: "Norway", dialCode: "47" },
  { iso: "OM", name: "Oman", dialCode: "968" },
  { iso: "PK", name: "Pakistan", dialCode: "92" },
  { iso: "PS", name: "Palestine", dialCode: "970" },
  { iso: "PA", name: "Panama", dialCode: "507" },
  { iso: "PY", name: "Paraguay", dialCode: "595" },
  { iso: "PE", name: "Peru", dialCode: "51" },
  { iso: "PH", name: "Philippines", dialCode: "63" },
  { iso: "PL", name: "Poland", dialCode: "48" },
  { iso: "PT", name: "Portugal", dialCode: "351" },
  { iso: "QA", name: "Qatar", dialCode: "974" },
  { iso: "RO", name: "Romania", dialCode: "40" },
  { iso: "RU", name: "Russia", dialCode: "7" },
  { iso: "SA", name: "Saudi Arabia", dialCode: "966" },
  { iso: "SN", name: "Senegal", dialCode: "221" },
  { iso: "RS", name: "Serbia", dialCode: "381" },
  { iso: "SG", name: "Singapore", dialCode: "65" },
  { iso: "SK", name: "Slovakia", dialCode: "421" },
  { iso: "SI", name: "Slovenia", dialCode: "386" },
  { iso: "ZA", name: "South Africa", dialCode: "27" },
  { iso: "KR", name: "South Korea", dialCode: "82" },
  { iso: "ES", name: "Spain", dialCode: "34" },
  { iso: "LK", name: "Sri Lanka", dialCode: "94" },
  { iso: "SD", name: "Sudan", dialCode: "249" },
  { iso: "SE", name: "Sweden", dialCode: "46" },
  { iso: "CH", name: "Switzerland", dialCode: "41" },
  { iso: "SY", name: "Syria", dialCode: "963" },
  { iso: "TW", name: "Taiwan", dialCode: "886" },
  { iso: "TJ", name: "Tajikistan", dialCode: "992" },
  { iso: "TZ", name: "Tanzania", dialCode: "255" },
  { iso: "TH", name: "Thailand", dialCode: "66" },
  { iso: "TN", name: "Tunisia", dialCode: "216" },
  { iso: "TR", name: "Turkey", dialCode: "90" },
  { iso: "TM", name: "Turkmenistan", dialCode: "993" },
  { iso: "UG", name: "Uganda", dialCode: "256" },
  { iso: "UA", name: "Ukraine", dialCode: "380" },
  { iso: "AE", name: "United Arab Emirates", dialCode: "971" },
  { iso: "GB", name: "United Kingdom", dialCode: "44" },
  { iso: "US", name: "United States", dialCode: "1" },
  { iso: "UY", name: "Uruguay", dialCode: "598" },
  { iso: "UZ", name: "Uzbekistan", dialCode: "998" },
  { iso: "VE", name: "Venezuela", dialCode: "58" },
  { iso: "VN", name: "Vietnam", dialCode: "84" },
  { iso: "YE", name: "Yemen", dialCode: "967" },
  { iso: "ZM", name: "Zambia", dialCode: "260" },
  { iso: "ZW", name: "Zimbabwe", dialCode: "263" },
].sort((a, b) => a.name.localeCompare(b.name));

export function getDialCountryByIso(iso: string): DialCountry | undefined {
  return WHATSAPP_DIAL_COUNTRIES.find((c) => c.iso === iso.toUpperCase());
}

/** Guess default ISO from `navigator.language` (client-only). */
export function guessDefaultCountryIso(): string {
  if (typeof window === "undefined") return "US";
  try {
    const region = (navigator.language || "").split("-")[1]?.toUpperCase();
    if (region && getDialCountryByIso(region)) return region;
  } catch {
    /* ignore */
  }
  return "US";
}

/** Build https://wa.me/<digits> from pasted URLs or raw international digits (legacy single field). */
export function buildWhatsAppProfileUrl(input: string): { ok: true; url: string } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Please enter your WhatsApp number" };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      const host = u.hostname.replace(/^www\./i, "").toLowerCase();
      if (host === "wa.me" || host === "api.whatsapp.com") {
        const pathSegment = u.pathname.replace(/^\//, "").split("/")[0] ?? "";
        const fromPath = pathSegment.replace(/\D/g, "");
        const fromQuery = u.searchParams.get("phone")?.replace(/\D/g, "") ?? "";
        const digits = fromPath || fromQuery;
        if (digits.length >= 8 && digits.length <= 15) {
          return { ok: true, url: `https://wa.me/${digits}` };
        }
      }
    } catch {
      /* fall through */
    }
  }

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return {
      ok: false,
      error:
        "Enter a valid number (8–15 digits including country code), or paste a wa.me link",
    };
  }
  return { ok: true, url: `https://wa.me/${digitsOnly}` };
}

/**
 * Combine selected country calling code with national input.
 * Strips leading 0 (national trunk prefix). If the user pasted a full international
 * number that already starts with the selected calling code, it is kept as-is.
 */
export function buildWhatsAppUrlFromDialAndNational(
  dialDigits: string,
  nationalInput: string
): { ok: true; url: string } | { ok: false; error: string } {
  const trimmed = nationalInput.trim();
  if (!trimmed) {
    return { ok: false, error: "Please enter your mobile number" };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return buildWhatsAppProfileUrl(trimmed);
  }

  const dc = dialDigits.replace(/\D/g, "");
  if (!dc) {
    return { ok: false, error: "Invalid country code" };
  }

  let digits = trimmed.replace(/\D/g, "");

  // Already includes selected country calling code (pasted +92… etc.)
  if (digits.startsWith(dc) && digits.length >= dc.length + 6 && digits.length <= 15) {
    return { ok: true, url: `https://wa.me/${digits}` };
  }

  while (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (!digits) {
    return { ok: false, error: "Enter your number without repeating the country code" };
  }

  const full = dc + digits;
  if (full.length < 8 || full.length > 15) {
    return {
      ok: false,
      error: "That number doesn’t look valid for WhatsApp (total should be 8–15 digits with country code)",
    };
  }
  return { ok: true, url: `https://wa.me/${full}` };
}
