import { CreateServerClient } from "@/utils/supabase/serverClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  console.log(requestUrl);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect");
  const redirectUrl = redirectTo as string;

  if (code) {
    const supabase = CreateServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(redirectUrl.replaceAll("!", "&"));
}
