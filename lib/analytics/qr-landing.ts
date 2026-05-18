/** True when the visitor likely arrived via a QR scan (query param). */
export function isQrLandingSearch(search: string): boolean {
  const params = new URLSearchParams(search);
  const from = params.get("from")?.toLowerCase();
  const utmSource = params.get("utm_source")?.toLowerCase();
  const utmMedium = params.get("utm_medium")?.toLowerCase();
  return (
    from === "qr" ||
    params.has("qr") ||
    utmSource === "qr" ||
    utmMedium === "qr"
  );
}

export function profileUrlWithQrSource(baseUrl: string, username: string): string {
  const url = new URL(`/${username}`, baseUrl.replace(/\/$/, ""));
  url.searchParams.set("from", "qr");
  return url.toString();
}
