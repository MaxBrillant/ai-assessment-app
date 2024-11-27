"use server";

import { CreateServerClient } from "@/utils/supabase/serverClient";

export async function getLastPaymentDetails(userId: string) {
  console.log("Getting user payment details...");
  const supabase = CreateServerClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id, credits, last_payment_reference")
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      "Error while getting user payment details: " + error.message
    );
  }

  console.log("User payment details fetched successfully");
  return {
    credits: data.length > 0 ? data[0].credits : undefined,
    reference: data.length > 0 ? data[0].last_payment_reference : undefined,
  };
}
export async function checkIfUserProfileExists() {
  const supabase = CreateServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const { data, error } = await supabase
    .from("user_profiles")
    .select()
    .eq("user_id", userId);
  if (error) {
    throw new Error(
      "Error while checking for existant user profile: " + error?.message
    );
  }
  if (data.length === 0) {
    return false;
  } else {
    return true;
  }
}
