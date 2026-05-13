import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon (Home Screen + Safari pinned tab). Larger, no internal
// rounding — iOS applies its own squircle mask, so a flat rounded
// background reads cleanest at this size.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background:
            "linear-gradient(135deg, #4A3AFF 0%, #8b5cf6 50%, #00C4B4 100%)",
        }}
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.18)"
          />
          <circle cx="7" cy="7" r="1.8" fill="#ffffff" />
          <circle
            cx="7"
            cy="7"
            r="3.6"
            stroke="#ffffff"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 22,
            height: 22,
            borderRadius: 9999,
            background: "#FF77A8",
            boxShadow: "0 0 0 4px rgba(255,255,255,0.5)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
