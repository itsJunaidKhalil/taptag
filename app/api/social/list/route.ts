import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("user_id");
    
    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }
    
    // Get auth token from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    // Create a client to verify the user
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!
    );
    
    // Verify the user
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Ensure user can only view their own links
    if (user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    const supabase = createClient(
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

    const { data, error } = await supabase
      .from("social_links")
      .select("*")
      .eq("user_id", userId)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Social links list error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data || [], error: null });
  } catch (error: any) {
    console.error("Social links list exception:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}


