"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import type { QrCardBrandingProfile } from "@/lib/qrCardCanvas";

export type { QrCardBrandingProfile };

interface QRCodeProps {
  url: string;
  size?: number;
  className?: string;
  showDownload?: boolean;
  showTitle?: boolean;
  /** When provided, users can download a full branded PNG (photo + QR + TapTag frame). */
  cardProfile?: QrCardBrandingProfile | null;
}

export default function QRCode({
  url,
  size = 256,
  className = "",
  showDownload = true,
  showTitle = true,
  cardProfile = null,
}: QRCodeProps) {
  const [downloadingPlain, setDownloadingPlain] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadPlainQr = async () => {
    if (!qrRef.current) return;

    setDownloadingPlain(true);
    try {
      const svgElement = qrRef.current.querySelector("svg");
      if (!svgElement) return;

      const clonedSvg = svgElement.cloneNode(true) as SVGElement;

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("width", "100%");
      rect.setAttribute("height", "100%");
      rect.setAttribute("fill", "white");
      clonedSvg.insertBefore(rect, clonedSvg.firstChild);

      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size + 40;
        canvas.height = size + 40;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          setDownloadingPlain(false);
          return;
        }

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20, size, size);

        canvas.toBlob((blob) => {
          if (!blob) {
            setDownloadingPlain(false);
            return;
          }

          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = `qr-code-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
          URL.revokeObjectURL(svgUrl);
          setDownloadingPlain(false);
        }, "image/png");
      };

      img.onerror = () => {
        setDownloadingPlain(false);
        URL.revokeObjectURL(svgUrl);
      };

      img.src = svgUrl;
    } catch (error) {
      console.error("Error downloading QR code:", error);
      setDownloadingPlain(false);
    }
  };

  const downloadDigitalCard = async () => {
    if (!cardProfile) return;
    setDownloadingCard(true);
    try {
      const { renderDigitalQrCardPng } = await import("@/lib/qrCardCanvas");
      const blob = await renderDigitalQrCardPng(cardProfile, url);
      if (!blob) {
        toast.error("Could not create the image. Try again or use plain QR.");
        return;
      }
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const slug = (cardProfile.username || "card").replace(/[^a-z0-9_-]/gi, "-");
      link.href = downloadUrl;
      link.download = `taptag-card-${slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      toast.success("Digital card downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate the digital card.");
    } finally {
      setDownloadingCard(false);
    }
  };

  const busy = downloadingPlain || downloadingCard;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {showTitle && (
        <h3 className="text-xl font-heading font-semibold mb-4 text-gray-900 dark:text-white">
          QR Code
        </h3>
      )}
      <div
        ref={qrRef}
        className="p-4 bg-white rounded-2xl shadow-soft-lg"
        style={{ display: "inline-block" }}
      >
        <QRCodeSVG
          value={url}
          size={size}
          level="H"
          includeMargin={true}
          fgColor="#000000"
          bgColor="#FFFFFF"
        />
      </div>
      {showDownload && (
        <div className="mt-4 flex flex-col items-center gap-2 w-full max-w-sm">
          {cardProfile && (
            <button
              type="button"
              onClick={downloadDigitalCard}
              disabled={busy}
              className="w-full px-6 py-3.5 bg-gradient-primary text-white rounded-2xl hover:opacity-90 transition-all duration-200 text-base font-semibold shadow-soft hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {downloadingCard ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating card…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Download digital card
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={downloadPlainQr}
            disabled={busy}
            className={`w-full px-6 py-3 rounded-2xl transition-all duration-200 text-base font-semibold flex items-center justify-center gap-2 border-2 ${
              cardProfile
                ? "border-primary-300/60 text-primary-700 dark:text-primary-300 bg-white/70 dark:bg-gray-800/70 hover:bg-primary-50/80 dark:hover:bg-gray-700/80"
                : "bg-gradient-primary text-white border-transparent hover:opacity-90 shadow-soft hover:shadow-glow"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {downloadingPlain ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Downloading…
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                {cardProfile ? "Plain QR only (PNG)" : "Download QR Code"}
              </>
            )}
          </button>
        </div>
      )}
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center max-w-xs">
        {cardProfile
          ? "Digital card includes your photo, TapTag frame, and a shareable link — great for email signatures and social posts."
          : "Scan this QR code to open the profile"}
      </p>
    </div>
  );
}
