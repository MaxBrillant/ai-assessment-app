"use server";

import { CreateServerClient } from "@/utils/supabase/serverClient";
import { getLastPaymentDetails } from "./getUserProfile";

export async function createUserProfile() {
  const supabase = CreateServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const fullName = (await supabase.auth.getUser()).data.user?.user_metadata
    .name;
  const email = (await supabase.auth.getUser()).data.user?.email;

  const { error } = await supabase.from("user_profiles").insert({
    user_id: userId,
    full_name: fullName ?? "",
    email_address: email,
  });

  if (error) {
    throw new Error("Error while creating user profile: " + error.message);
  }
}

export async function updateUserProfilePaymentDetails(props: {
  credits: number | undefined;
  plan: "plus" | "pro";
  userId: string;
  reference: string;
}) {
  console.log("Updating user payment details...");
  const supabase = CreateServerClient();
  const { error } = await supabase
    .from("user_profiles")
    .update({
      credits:
        (props.credits ? props.credits : 0) +
        (props.plan === "plus" ? 200 : 350),
      last_payment_reference: props.reference,
    })
    .eq("user_id", props.userId);

  if (error) {
    throw new Error(
      "Error while updating user payment details: " + error.message
    );
  }

  console.log("User payment details updated successfully.");
}

export async function reduceCredits(reducedCredits: number) {
  const supabase = CreateServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id as string;
  const paymentDetails = await getLastPaymentDetails(userId);
  const { error } = await supabase
    .from("user_profiles")
    .update({
      credits: paymentDetails.credits - reducedCredits,
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error("Error while reducing credits: " + error.message);
  }
}
