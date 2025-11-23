import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if profile exists, if not create one
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existingProfile) {
          // Create profile for OAuth users
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
          });
        }
      }

      // Use the production URL from environment or construct from request
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      const redirectUrl = appUrl 
        ? `${appUrl}${next}`
        : `${requestUrl.protocol}//${requestUrl.host}${next}`;

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Return the user to an error page with instructions
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const errorUrl = appUrl
    ? `${appUrl}/auth/login?error=Could not authenticate user`
    : `${requestUrl.origin}/auth/login?error=Could not authenticate user`;
  
  return NextResponse.redirect(errorUrl);
}
