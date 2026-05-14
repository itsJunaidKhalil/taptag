import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    const userId = formData.get("userId") as string;
    const uploadSlot = (formData.get("uploadSlot") as string) || "default";

    if (!file || !bucket || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: file, bucket, or userId" },
        { status: 400 }
      );
    }

    // Validate bucket
    if (bucket !== "profile-images" && bucket !== "banners") {
      return NextResponse.json(
        { error: "Invalid bucket name" },
        { status: 400 }
      );
    }

    if (uploadSlot !== "default" && uploadSlot !== "company_logo") {
      return NextResponse.json({ error: "Invalid uploadSlot" }, { status: 400 });
    }
    if (uploadSlot === "company_logo" && bucket !== "banners") {
      return NextResponse.json(
        { error: "company_logo uploads must use the banners bucket" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get the authorization header to verify user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Create a new client with the user's access token for storage operations
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const authenticatedSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName =
      uploadSlot === "company_logo"
        ? `company-logo-${userId}.${fileExt}`
        : `${userId}.${fileExt}`;
    const filePath = `${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Remove old file if exists (ignore errors)
    await authenticatedSupabase.storage.from(bucket).remove([fileName]).catch(() => {});
    if (uploadSlot === "company_logo") {
      const exts = ["jpg", "jpeg", "png", "webp", "gif"];
      const stale = exts
        .filter((e) => e !== fileExt)
        .map((e) => `company-logo-${userId}.${e}`);
      await authenticatedSupabase.storage.from(bucket).remove(stale).catch(() => {});
    }

    // Upload new file
    const { error: uploadError } = await authenticatedSupabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = authenticatedSupabase.storage.from(bucket).getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl, error: null });
  } catch (error: any) {
    console.error("Error in upload route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

