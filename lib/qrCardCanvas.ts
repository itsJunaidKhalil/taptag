import QRCode from "qrcode";

/** Profile fields used to paint the downloadable marketing card (PNG). */
export type QrCardBrandingProfile = {
  full_name: string | null;
  company: string | null;
  username: string | null;
  profile_image_url?: string | null;
  banner_image_url?: string | null;
  company_logo_url?: string | null;
  /** If set, shown on the digital card only (not the login email). */
  contact_email?: string | null;
};

const W = 1200;
const H = 1920;
const FRAME = 40;
const INNER_R = 28;

function stripQuery(url: string) {
  const i = url.indexOf("?");
  return i === -1 ? url : url.slice(0, i);
}

function loadImageCors(url: string | null | undefined): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      const fallback = new Image();
      fallback.crossOrigin = "anonymous";
      fallback.onload = () => resolve(fallback);
      fallback.onerror = () => resolve(null);
      fallback.src = stripQuery(url);
    };
    img.src = url;
  });
}

/**
 * CSS object-fit: cover with optional vertical focus toward the top (typical
 * for “header” banners so faces/logos near the top are not cropped away).
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  focus: "center" | "top" = "top",
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const scale = Math.max(dw / iw, dh / ih);
  const sw = dw / scale;
  const sh = dh / scale;
  let sx = (iw - sw) / 2;
  let sy = (ih - sh) / 2;
  if (focus === "top") {
    sy = Math.max(0, Math.min(ih - sh, (ih - sh) * 0.06));
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

/** Draws the TapTag mark (gradient tile + tag glyph + accent dot), aligned with app/icon.tsx. */
function drawTapTagBrandMark(ctx: CanvasRenderingContext2D, x: number, y: number, box: number) {
  const r = box * 0.22;
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x + box, y + box);
  g.addColorStop(0, "#4A3AFF");
  g.addColorStop(0.55, "#8b5cf6");
  g.addColorStop(1, "#00C4B4");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x, y, box, box, r);
  ctx.fill();

  const pad = box * 0.14;
  const s = box - pad * 2;
  const ox = x + pad;
  const oy = y + pad;
  const scale = s / 24;

  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  const tag = new Path2D(
    "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z",
  );
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fill(tag);
  ctx.stroke(tag);

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(7, 7, 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(7, 7, 3.6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const dot = box * 0.2;
  ctx.fillStyle = "#FF77A8";
  ctx.beginPath();
  ctx.arc(x + box - dot * 0.55, y + dot * 0.55, dot * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.restore();
}

/** Letterboxed image inside a rounded square (company logo). */
function drawImageContainRounded(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  outer: number,
  cornerR: number,
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;

  const half = outer / 2;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.beginPath();
  ctx.roundRect(cx - half, cy - half, outer, outer, cornerR);
  ctx.clip();

  const innerPad = outer * 0.1;
  const maxW = outer - innerPad * 2;
  const maxH = outer - innerPad * 2;
  const scale = Math.min(maxW / iw, maxH / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = cx - dw / 2;
  const dy = cy - dh / 2;
  ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
  ctx.restore();

  ctx.strokeStyle = "rgba(15,23,42,0.12)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(cx - half, cy - half, outer, outer, cornerR);
  ctx.stroke();
}

function initialsFrom(name: string | null, username: string | null): string {
  const n = (name || username || "?").trim();
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return n.slice(0, 2).toUpperCase() || "TT";
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let line = words[0];
  for (let i = 1; i < words.length; i++) {
    const test = `${line} ${words[i]}`;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      lines.push(line);
      line = words[i];
    }
  }
  lines.push(line);
  return lines.slice(0, 3);
}

/** Outer ring: light neutral frame on white for a clean print/share look. */
function drawGradientFrame(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#e8ecf4");
  g.addColorStop(0.5, "#f1f5f9");
  g.addColorStop(1, "#e2e8f0");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 36);
  ctx.roundRect(FRAME, FRAME, W - FRAME * 2, H - FRAME * 2, INNER_R);
  ctx.fill("evenodd");
}

/**
 * Renders a high-resolution branded “digital card” PNG: light frame, optional
 * banner in a short top header band (logos + overlapping avatar), white body
 * for name/email, optional company logo tile, QR panel.
 */
export async function renderDigitalQrCardPng(
  profile: QrCardBrandingProfile,
  profilePublicUrl: string,
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const ix = FRAME;
  const iy = FRAME;
  const iw = W - FRAME * 2;
  const ih = H - FRAME * 2;

  drawGradientFrame(ctx);

  // Header band height: wide strip only — banner is painted here so artwork is
  // not stretched across the full 1920px canvas (avoids blown-up logos).
  const headerBandH = Math.min(500, Math.round(iw * 0.38));

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(ix, iy, iw, ih, INNER_R);
  ctx.clip();

  // Body: clean white (name / email / QR zone sit on this).
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(ix, iy, iw, ih);

  const banner = await loadImageCors(profile.banner_image_url);
  if (banner) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(ix, iy, iw, headerBandH);
    ctx.clip();
    drawImageCover(ctx, banner, ix, iy, iw, headerBandH, "top");
    ctx.restore();

    ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
    ctx.fillRect(ix, iy, iw, headerBandH);

    // Blend banner into white body.
    const fade = ctx.createLinearGradient(0, iy + headerBandH - 120, 0, iy + headerBandH + 100);
    fade.addColorStop(0, "rgba(255, 255, 255, 0)");
    fade.addColorStop(0.45, "rgba(255, 255, 255, 0.55)");
    fade.addColorStop(1, "rgba(255, 255, 255, 1)");
    ctx.fillStyle = fade;
    ctx.fillRect(ix, iy + headerBandH - 120, iw, 220);
  }

  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(ix, iy, iw, ih, INNER_R);
  ctx.clip();

  const pad = 32;
  const brandBox = 64;
  drawTapTagBrandMark(ctx, ix + pad, iy + pad, brandBox);

  const logoImg = await loadImageCors(profile.company_logo_url);
  const logoOuter = 196;
  if (logoImg) {
    const lx = ix + iw - pad - logoOuter / 2;
    const ly = iy + pad + logoOuter / 2;
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = "rgba(255,255,255,0.97)";
    ctx.beginPath();
    ctx.roundRect(ix + iw - pad - logoOuter, iy + pad, logoOuter, logoOuter, 22);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    drawImageContainRounded(ctx, logoImg, lx, ly, logoOuter - 18, 16);
  }

  const cx = ix + iw / 2;
  const avatarR = 108;
  // Avatar straddles bottom of header band (LinkedIn-style) so it reads with logos, not mid-stretch.
  const avatarY = iy + headerBandH - avatarR * 0.42;

  const photo = await loadImageCors(profile.profile_image_url);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, avatarY, avatarR, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (photo) {
    drawImageCover(ctx, photo, cx - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2, "center");
  } else {
    const g3 = ctx.createRadialGradient(cx - 40, avatarY - 40, 0, cx, avatarY, avatarR);
    g3.addColorStop(0, "#eef2ff");
    g3.addColorStop(1, "#c7d2fe");
    ctx.fillStyle = g3;
    ctx.fillRect(cx - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "bold 52px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initialsFrom(profile.full_name, profile.username), cx, avatarY);
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(15,23,42,0.1)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, avatarY, avatarR + 2, 0, Math.PI * 2);
  ctx.stroke();

  const displayName = (profile.full_name || profile.username || "TapTag member").trim();
  const companyRaw = (profile.company || "").trim();
  let titleLine = "";
  let orgLine = "";
  const m = companyRaw.match(/^(.+?)\s+at\s+(.+)$/i);
  if (m) {
    titleLine = m[1].trim();
    orgLine = m[2].trim();
  } else if (companyRaw) {
    orgLine = companyRaw;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#0f172a";
  ctx.shadowColor = "rgba(15,23,42,0.08)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  ctx.font = "bold 48px system-ui, -apple-system, Segoe UI, sans-serif";
  const nameLines = wrapLines(ctx, displayName, iw - pad * 4);
  let ty = avatarY + avatarR + 32;
  for (const line of nameLines) {
    ctx.fillText(line, cx, ty);
    ty += 52;
  }
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.font = "26px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillStyle = "#475569";
  if (titleLine) {
    ctx.fillText(titleLine, cx, ty + 6);
    ty += 36;
  }
  if (orgLine) {
    const orgLines = wrapLines(ctx, orgLine, iw - pad * 4);
    for (const ol of orgLines) {
      ctx.fillText(ol, cx, ty + 10);
      ty += 32;
    }
  }

  const cardEmail = (profile.contact_email || "").trim();
  if (cardEmail) {
    ctx.font = "22px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillStyle = "#334155";
    const emLines = wrapLines(ctx, cardEmail, iw - pad * 4);
    for (const el of emLines) {
      ctx.fillText(el, cx, ty + 14);
      ty += 28;
    }
  }

  ctx.restore();

  const panelW = Math.min(iw - 48, 980);
  const panelH = 780;
  const px = (W - panelW) / 2;
  const py = H - FRAME - panelH - 28;

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(15,23,42,0.12)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  ctx.beginPath();
  ctx.roundRect(px, py, panelW, panelH, 32);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = "rgba(15,23,42,0.08)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(px, py, panelW, panelH, 32);
  ctx.stroke();

  const qrTarget = Math.min(640, panelW - 72);
  const qrDataUrl = await QRCode.toDataURL(profilePublicUrl, {
    width: qrTarget,
    margin: 1,
    errorCorrectionLevel: "H",
    color: { dark: "#0f172a", light: "#ffffff" },
  });
  const qrImg = await new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = qrDataUrl;
  });
  if (qrImg) {
    const qs = qrTarget;
    ctx.drawImage(qrImg, px + (panelW - qs) / 2, py + 42, qs, qs);
  }

  ctx.fillStyle = "#64748b";
  ctx.font = "500 22px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Scan to connect", W / 2, py + panelH - 78);
  ctx.fillStyle = "#4A3AFF";
  ctx.font = "600 24px ui-monospace, SFMono-Regular, Menlo, monospace";
  const host = (() => {
    try {
      return new URL(profilePublicUrl).host;
    } catch {
      return "taptag.biz";
    }
  })();
  ctx.fillText(`${host}${profile.username ? `/${profile.username}` : ""}`, W / 2, py + panelH - 46);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/png",
      0.92,
    );
  });
}
