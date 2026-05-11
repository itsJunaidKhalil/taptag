import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/getProfile";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon({ params }: { params: { username: string } }) {
  let profile: any = null;
  try {
    profile = await getProfile(params.username);
  } catch {
    profile = null;
  }

  const initial =
    (profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || "T").toUpperCase();
  const photoUrl: string | null = profile?.profile_image_url || null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4A3AFF 0%, #00C4B4 100%)",
          color: "#fff",
          fontSize: 36,
          fontWeight: 800,
          borderRadius: 14,
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            width={64}
            height={64}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 }}
          />
        ) : (
          initial
        )}
      </div>
    ),
    { ...size },
  );
}
