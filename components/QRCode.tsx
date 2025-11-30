"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeProps {
  url: string;
  size?: number;
  className?: string;
  showDownload?: boolean;
  showTitle?: boolean;
}

export default function QRCode({
  url,
  size = 256,
  className = "",
  showDownload = true,
  showTitle = true,
}: QRCodeProps) {
  const [downloading, setDownloading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!qrRef.current) return;

    setDownloading(true);
    try {
      // Get the SVG element
      const svgElement = qrRef.current.querySelector("svg");
      if (!svgElement) return;

      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      
      // Set background color to white
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("width", "100%");
      rect.setAttribute("height", "100%");
      rect.setAttribute("fill", "white");
      clonedSvg.insertBefore(rect, clonedSvg.firstChild);

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create a canvas to convert SVG to PNG
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size + 40; // Add padding
        canvas.height = size + 40;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          setDownloading(false);
          return;
        }

        // Fill white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the QR code
        ctx.drawImage(img, 20, 20, size, size);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (!blob) {
            setDownloading(false);
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
          setDownloading(false);
        }, "image/png");
      };

      img.onerror = () => {
        setDownloading(false);
        URL.revokeObjectURL(svgUrl);
      };

      img.src = svgUrl;
    } catch (error) {
      console.error("Error downloading QR code:", error);
      setDownloading(false);
    }
  };

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
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="mt-4 px-6 py-3 bg-gradient-primary text-white rounded-2xl hover:opacity-90 transition-all duration-200 text-base font-semibold shadow-soft hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {downloading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download QR Code
            </>
          )}
        </button>
      )}
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center max-w-xs">
        Scan this QR code to open the profile
      </p>
    </div>
  );
}
