import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/getProfile";

export const runtime = "edge";
export const alt = "TapTag digital business card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: { username: string } }) {
  let profile: any = null;
  try {
    profile = await getProfile(params.username);
  } catch {
    profile = null;
  }

  const fullName = profile?.full_name || profile?.username || "TapTag";
  const company = profile?.company || "Digital Business Card";
  const initial = (fullName as string).charAt(0).toUpperCase();
  const username = profile?.username || params.username;
  const bannerUrl: string | null = profile?.banner_image_url || null;
  const photoUrl: string | null = profile?.profile_image_url || null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #4A3AFF 0%, #00C4B4 100%)",
          position: "relative",
        }}
      >
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.25,
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(74,58,255,0.85) 0%, rgba(0,196,180,0.85) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            padding: 80,
            color: "#fff",
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              width={220}
              height={220}
              style={{
                borderRadius: 9999,
                border: "8px solid rgba(255,255,255,0.95)",
                objectFit: "cover",
                boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
              }}
            />
          ) : (
            <div
              style={{
                width: 220,
                height: 220,
                borderRadius: 9999,
                border: "8px solid rgba(255,255,255,0.95)",
                background: "rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 110,
                fontWeight: 800,
                color: "#fff",
              }}
            >
              {initial}
            </div>
          )}

          <div
            style={{
              marginTop: 36,
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.05,
              textAlign: "center",
              letterSpacing: -1.5,
              maxWidth: 1000,
            }}
          >
            {fullName}
          </div>

          <div
            style={{
              marginTop: 14,
              fontSize: 32,
              opacity: 0.92,
              textAlign: "center",
              maxWidth: 1000,
            }}
          >
            {company}
          </div>

          <div
            style={{
              marginTop: 40,
              padding: "12px 28px",
              background: "rgba(255,255,255,0.18)",
              borderRadius: 9999,
              fontSize: 26,
              fontWeight: 600,
              border: "2px solid rgba(255,255,255,0.4)",
            }}
          >
            taptag.biz/{username}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 36,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "rgba(255,255,255,0.9)",
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "#fff",
              color: "#4A3AFF",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 22,
            }}
          >
            T
          </div>
          TapTag
        </div>
      </div>
    ),
    { ...size },
  );
}
