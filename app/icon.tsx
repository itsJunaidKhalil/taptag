import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Site-wide TapTag favicon. Matches the brand mark used in the navbar and
// footer: gradient rounded square with a white tag/tap glyph and a small
// secondary-color dot for the NFC pulse. Rendered through next/og so we
// don't have to commit a binary asset and the icon is regenerated on the
// edge whenever this file changes.
//
// The dynamic per-profile favicon at app/[username]/icon.tsx takes
// precedence on that specific route, so user profile tabs still get their
// own avatar-based icon.
export default function Icon() {
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
          borderRadius: 8,
          background: "linear-gradient(135deg, #4A3AFF 0%, #8b5cf6 50%, #00C4B4 100%)",
        }}
      >
        <svg
          width="22"
          height="22"
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
            fill="rgba(255,255,255,0.2)"
          />
          <circle cx="7" cy="7" r="1.6" fill="#ffffff" />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 6,
            height: 6,
            borderRadius: 9999,
            background: "#FF77A8",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.6)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
