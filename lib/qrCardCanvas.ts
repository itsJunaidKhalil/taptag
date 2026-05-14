import QRCode from "qrcode";

/** Profile fields used to paint the downloadable marketing card (PNG). */
export type QrCardBrandingProfile = {
  full_name: string | null;
  company: string | null;
  username: string | null;
  profile_image_url?: string | null;
  banner_image_url?: string | null;
  company_logo_url?: string | null;
};

const W = 1200;
const H = 1800;
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

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
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
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
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

function drawGradientFrame(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#4A3AFF");
  g.addColorStop(0.45, "#7c3aed");
  g.addColorStop(1, "#00C4B4");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 36);
  ctx.roundRect(FRAME, FRAME, W - FRAME * 2, H - FRAME * 2, INNER_R);
  ctx.fill("evenodd");
}

/**
 * Renders a high-resolution branded “digital card” PNG: TapTag gradient frame,
 * optional banner as company-style background, optional company logo, avatar,
 * name, role/company text, QR, and footer URL for marketing.
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

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(ix, iy, iw, ih, INNER_R);
  ctx.clip();

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
  }

  ctx.restore();

  // Inner content (no clip) for crisp vectors on top of rounded card edge
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(ix, iy, iw, ih, INNER_R);
  ctx.clip();

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

  const photo = await loadImageCors(profile.profile_image_url);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, avatarY, avatarR, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (photo) {
    drawImageCover(ctx, photo, cx - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
  } else {
    const g3 = ctx.createRadialGradient(cx - 40, avatarY - 40, 0, cx, avatarY, avatarR);
    g3.addColorStop(0, "#a78bfa");
    g3.addColorStop(1, "#4c1d95");
    ctx.fillStyle = g3;
    ctx.fillRect(cx - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "bold 56px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initialsFrom(profile.full_name, profile.username), cx, avatarY);
  }
  ctx.restore();

  // Avatar ring
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 8;
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
  }
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.font = "28px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(226,232,240,0.95)";
  if (titleLine) {
    ctx.fillText(titleLine, cx, ty + 8);
    ty += 40;
  }
  if (orgLine) {
    const orgLines = wrapLines(ctx, orgLine, iw - pad * 4);
    for (const ol of orgLines) {
      ctx.fillText(ol, cx, ty + 12);
      ty += 36;
    }
  }

  ctx.restore();

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
    const qs = 400;
    ctx.drawImage(qrImg, px + (panelW - qs) / 2, py + 36, qs, qs);
  }

  ctx.fillStyle = "#64748b";
  ctx.font = "500 22px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Scan to connect", W / 2, py + panelH - 72);
  ctx.fillStyle = "#4A3AFF";
  ctx.font = "600 24px ui-monospace, SFMono-Regular, Menlo, monospace";
  const host = (() => {
    try {
      return new URL(profilePublicUrl).host;
    } catch {
      return "taptag.biz";
    }
  })();
  ctx.fillText(`${host}${profile.username ? `/${profile.username}` : ""}`, W / 2, py + panelH - 42);

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
