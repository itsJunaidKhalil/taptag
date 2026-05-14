import QRCode from "qrcode";

/** Profile fields used to paint the downloadable marketing card (PNG). */
export type QrCardBrandingProfile = {
  full_name: string | null;
  company: string | null;
  username: string | null;
  profile_image_url?: string | null;
  banner_image_url?: string | null;
  company_logo_url?: string | null;
<<<<<<< HEAD
  /** If set, shown on the digital card only (not the login email). */
  contact_email?: string | null;
};

const W = 1200;
const H = 1920;
=======
};

const W = 1200;
const H = 1800;
>>>>>>> origin/main
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

<<<<<<< HEAD
/**
 * CSS object-fit: cover with optional vertical focus toward the top (typical
 * for “header” banners so faces/logos near the top are not cropped away).
 */
=======
>>>>>>> origin/main
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
<<<<<<< HEAD
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
=======
) {
  const ir = img.width / img.height;
  const br = dw / dh;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (ir > br) {
    sw = img.height * br;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / br;
    sy = (img.height - sh) / 2;
>>>>>>> origin/main
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

<<<<<<< HEAD
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

=======
>>>>>>> origin/main
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

<<<<<<< HEAD
/** Outer ring: light neutral frame on white for a clean print/share look. */
function drawGradientFrame(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#e8ecf4");
  g.addColorStop(0.5, "#f1f5f9");
  g.addColorStop(1, "#e2e8f0");
=======
function drawGradientFrame(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#4A3AFF");
  g.addColorStop(0.45, "#7c3aed");
  g.addColorStop(1, "#00C4B4");
>>>>>>> origin/main
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 36);
  ctx.roundRect(FRAME, FRAME, W - FRAME * 2, H - FRAME * 2, INNER_R);
  ctx.fill("evenodd");
}

/**
<<<<<<< HEAD
 * Renders a high-resolution branded “digital card” PNG: light frame, optional
 * banner in a short top header band (logos + overlapping avatar), white body
 * for name/email, optional company logo tile, QR panel.
=======
 * Renders a high-resolution branded “digital card” PNG: TapTag gradient frame,
 * optional banner as company-style background, optional company logo, avatar,
 * name, role/company text, QR, and footer URL for marketing.
>>>>>>> origin/main
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

<<<<<<< HEAD
  // Header band height: wide strip only — banner is painted here so artwork is
  // not stretched across the full 1920px canvas (avoids blown-up logos).
  const headerBandH = Math.min(500, Math.round(iw * 0.38));

=======
>>>>>>> origin/main
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(ix, iy, iw, ih, INNER_R);
  ctx.clip();

<<<<<<< HEAD
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
=======
  const banner = await loadImageCors(profile.banner_image_url);
  if (banner) {
    drawImageCover(ctx, banner, ix, iy, iw, ih);
    ctx.fillStyle = "rgba(15, 23, 42, 0.62)";
    ctx.fillRect(ix, iy, iw, ih);
  } else {
    const g2 = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih);
    g2.addColorStop(0, "#312e81");
    g2.addColorStop(0.5, "#4c1d95");
    g2.addColorStop(1, "#134e4a");
    ctx.fillStyle = g2;
    ctx.fillRect(ix, iy, iw, ih);
>>>>>>> origin/main
  }

  ctx.restore();

<<<<<<< HEAD
=======
  // Inner content (no clip) for crisp vectors on top of rounded card edge
>>>>>>> origin/main
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(ix, iy, iw, ih, INNER_R);
  ctx.clip();

<<<<<<< HEAD
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
=======
  const pad = 36;
  // TapTag wordmark pill (top-left)
  ctx.font = "bold 26px system-ui, -apple-system, Segoe UI, sans-serif";
  const brandW = ctx.measureText("TapTag").width + 44;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath();
  ctx.roundRect(ix + pad, iy + pad, brandW, 48, 14);
  ctx.fill();
  ctx.fillStyle = "#4A3AFF";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("TapTag", ix + pad + 22, iy + pad + 24);

  // Optional company logo (top-right)
  const logoImg = await loadImageCors(profile.company_logo_url);
  if (logoImg) {
    const lw = 132;
    const lx = ix + iw - pad - lw;
    const ly = iy + pad;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(lx - 8, ly - 8, lw + 16, lw + 16, 18);
    ctx.fill();
    const s = lw - 16;
    ctx.drawImage(logoImg, lx, ly, s, s);
  }

  const cx = ix + iw / 2;
  const avatarY = iy + 220;
  const avatarR = 118;
>>>>>>> origin/main

  const photo = await loadImageCors(profile.profile_image_url);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, avatarY, avatarR, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (photo) {
<<<<<<< HEAD
    drawImageCover(ctx, photo, cx - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2, "center");
  } else {
    const g3 = ctx.createRadialGradient(cx - 40, avatarY - 40, 0, cx, avatarY, avatarR);
    g3.addColorStop(0, "#eef2ff");
    g3.addColorStop(1, "#c7d2fe");
    ctx.fillStyle = g3;
    ctx.fillRect(cx - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "bold 52px system-ui, -apple-system, Segoe UI, sans-serif";
=======
    drawImageCover(ctx, photo, cx - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
  } else {
    const g3 = ctx.createRadialGradient(cx - 40, avatarY - 40, 0, cx, avatarY, avatarR);
    g3.addColorStop(0, "#a78bfa");
    g3.addColorStop(1, "#4c1d95");
    ctx.fillStyle = g3;
    ctx.fillRect(cx - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "bold 56px system-ui, -apple-system, Segoe UI, sans-serif";
>>>>>>> origin/main
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initialsFrom(profile.full_name, profile.username), cx, avatarY);
  }
  ctx.restore();

<<<<<<< HEAD
  ctx.strokeStyle = "rgba(15,23,42,0.1)";
  ctx.lineWidth = 6;
=======
  // Avatar ring
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 8;
>>>>>>> origin/main
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
<<<<<<< HEAD
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
=======
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 2;
  ctx.font = "bold 52px system-ui, -apple-system, Segoe UI, sans-serif";
  const nameLines = wrapLines(ctx, displayName, iw - pad * 4);
  let ty = avatarY + avatarR + 36;
  for (const line of nameLines) {
    ctx.fillText(line, cx, ty);
    ty += 58;
>>>>>>> origin/main
  }
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

<<<<<<< HEAD
  ctx.font = "26px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillStyle = "#475569";
  if (titleLine) {
    ctx.fillText(titleLine, cx, ty + 6);
    ty += 36;
=======
  ctx.font = "28px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(226,232,240,0.95)";
  if (titleLine) {
    ctx.fillText(titleLine, cx, ty + 8);
    ty += 40;
>>>>>>> origin/main
  }
  if (orgLine) {
    const orgLines = wrapLines(ctx, orgLine, iw - pad * 4);
    for (const ol of orgLines) {
<<<<<<< HEAD
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
=======
      ctx.fillText(ol, cx, ty + 12);
      ty += 36;
>>>>>>> origin/main
    }
  }

  ctx.restore();

<<<<<<< HEAD
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
=======
  // QR panel (bottom, sits on inner card — draw outside clip from above restore)
  const panelW = 640;
  const panelH = 560;
  const px = (W - panelW) / 2;
  const py = H - FRAME - panelH - 36;

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(15,23,42,0.25)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;
  ctx.beginPath();
  ctx.roundRect(px, py, panelW, panelH, 28);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const qrDataUrl = await QRCode.toDataURL(profilePublicUrl, {
    width: 420,
>>>>>>> origin/main
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
<<<<<<< HEAD
    const qs = qrTarget;
    ctx.drawImage(qrImg, px + (panelW - qs) / 2, py + 42, qs, qs);
=======
    const qs = 400;
    ctx.drawImage(qrImg, px + (panelW - qs) / 2, py + 36, qs, qs);
>>>>>>> origin/main
  }

  ctx.fillStyle = "#64748b";
  ctx.font = "500 22px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
<<<<<<< HEAD
  ctx.fillText("Scan to connect", W / 2, py + panelH - 78);
=======
  ctx.fillText("Scan to connect", W / 2, py + panelH - 72);
>>>>>>> origin/main
  ctx.fillStyle = "#4A3AFF";
  ctx.font = "600 24px ui-monospace, SFMono-Regular, Menlo, monospace";
  const host = (() => {
    try {
      return new URL(profilePublicUrl).host;
    } catch {
      return "taptag.biz";
    }
  })();
<<<<<<< HEAD
  ctx.fillText(`${host}${profile.username ? `/${profile.username}` : ""}`, W / 2, py + panelH - 46);
=======
  ctx.fillText(`${host}${profile.username ? `/${profile.username}` : ""}`, W / 2, py + panelH - 42);
>>>>>>> origin/main

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
