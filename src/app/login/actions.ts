"use server";

import { CreateServerClient } from "@/utils/supabase/serverClient";
import { EmailOtpType, Provider } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginWithEmail(email: string) {
  const supabase = CreateServerClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: email,
  };

  const { error } = await supabase.auth.signInWithOtp(data);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
}

export async function loginWithGoogle(redirectUrl: string) {
  console.log(redirectUrl);
  const supabase = CreateServerClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    provider: "google" as Provider,
    options: {
      redirectTo:
        new URL(redirectUrl).origin + "/auth/callback?redirect=" + redirectUrl,
    },
  };

  const { data: googleData, error } = await supabase.auth.signInWithOAuth(data);

  if (error) {
    throw new Error(error.message);
  }

  redirect(googleData.url);
}

export async function verifyOTP(
  email: string,
  token: string,
  redirectUrl: string,
) {
  const supabase = CreateServerClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: email,
    token: token,
    type: "email" as EmailOtpType,
    options: {
      redirectTo: redirectUrl,
    },
  };

  const { error } = await supabase.auth.verifyOtp(data);

  if (error) {
    throw new Error(error.message);
  }
}
