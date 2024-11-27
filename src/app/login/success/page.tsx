"use client";

import { createUserProfile } from "@/app/api/auth/createUserProfile";
import { checkIfUserProfileExists } from "@/app/api/auth/getUserProfile";
import { sendWelcomeEmail } from "@/app/api/email/sendEmail";
import Loading from "@/app/loading";
import { CreateBrowserClient } from "@/utils/supabase/browserClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Success() {
  const { push } = useRouter();
  useEffect(() => {
    const checkForUser = async () => {
      const supabase = await CreateBrowserClient();

      const authenticatedUser = await supabase.auth
        .getUser()
        .then((user) => user.data.user);

      if (authenticatedUser) {
        try {
          const profileExists = await checkIfUserProfileExists();
          if (!profileExists) {
            await createUserProfile();
            await sendWelcomeEmail(authenticatedUser.email as string);
          }
        } catch (error) {
          throw new Error("Error while creating user profile: " + error);
        }
        window.close();
      } else {
        push("/login");
      }
    };
    checkForUser();
  }, []);
  return <Loading />;
}
