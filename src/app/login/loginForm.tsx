"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithEmail, loginWithGoogle, verifyOTP } from "./actions";
import { useEffect, useState, useTransition } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CreateBrowserClient } from "@/utils/supabase/browserClient";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import { checkIfUserProfileExists } from "../api/auth/getUserProfile";
import { createUserProfile } from "../api/auth/createUserProfile";
import { sendWelcomeEmail } from "../api/email/sendEmail";

export default function LoginForm(props: {
  heading: string;
  redirectUrl: string | undefined;
}) {
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [otp, setOTP] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();

  const { push } = useRouter();
  const searchParams = useSearchParams();

  let redirectUrl = (
    props.redirectUrl
      ? props.redirectUrl?.includes("http")
        ? (props.redirectUrl as string)
        : location.origin + (props.redirectUrl as string)
      : location.origin + "/dashboard"
  ).replaceAll("!", "&");

  useEffect(() => {
    const checkForAuthenticatedUser = () =>
      startTransition(async () => {
        const supabase = await CreateBrowserClient();

        const authenticatedUser = await supabase.auth
          .getUser()
          .then((user) => user.data.user);

        if (authenticatedUser) {
          push(redirectUrl as string);
        }
      });

    checkForAuthenticatedUser();
  }, []);

  return (
    <div className="flex flex-col gap-5 mx-auto items-center max-w-sm p-7">
      <p className="text-lg font-bold">{props.heading}</p>
      <button
        disabled={isPending}
        className="p-2 bg-black/5 rounded-lg text-sm flex gap-2 items-center justify-center text-black/80 hover:bg-black/10"
        onClick={() =>
          startTransition(async () => {
            if (redirectUrl) {
              const url = await loginWithGoogle(redirectUrl).catch((error) => {
                toast({
                  description:
                    "Something went wrong while logging in with Google",
                  title: "Error",
                  variant: "destructive",
                });
              });

              if (url) {
                const newWindow = window.open("", "_blank");
                if (newWindow) {
                  newWindow.location.href = url;

                  let intervalId: NodeJS.Timeout | undefined;
                  const checkForAuthenticatedUser = async () => {
                    intervalId = setInterval(async () => {
                      const supabase = await CreateBrowserClient();
                      const authenticatedUser = await supabase.auth
                        .getUser()
                        .then((user) => user.data.user);

                      if (authenticatedUser) {
                        push(redirectUrl as string);
                        clearInterval(intervalId);
                      }
                    }, 5000); // check every 5 seconds

                    return () => clearInterval(intervalId);
                  };

                  await checkForAuthenticatedUser();
                }
              }
            }
          })
        }
      >
        <FcGoogle className="w-5 h-5" />
        Continue with Google
      </button>
      <p>or</p>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm">
          Email Address
        </label>
        <Input
          type="email"
          placeholder="john@example.com"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          disabled={
            !email || email.length < 5 || !email.includes("@") || isPending
          }
          onClick={() =>
            startTransition(async () => {
              if (email) {
                try {
                  await loginWithEmail(email);
                  push(
                    window.location.href +
                      (window.location.href.includes("?")
                        ? "&otp=true"
                        : " ?otp=true")
                  );
                } catch (error) {
                  toast({
                    description:
                      "Something went wrong while logging in with email",
                    title: "Error",
                    variant: "destructive",
                  });
                }
              }
            })
          }
        >
          Continue
        </Button>
      </div>

      {searchParams.get("otp") && searchParams.get("otp") === "true" && (
        <Dialog
          open={true}
          onOpenChange={(value) => {
            if (!value) push(window.location.href.split("otp")[0]);
          }}
        >
          <DialogContent>
            <p>We have sent a verification code to {email}</p>
            <p>Write the code below</p>
            <Input
              placeholder="123456"
              type="number"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
            />
            <Button
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  if (redirectUrl && email && otp) {
                    try {
                      await verifyOTP(email, otp, redirectUrl);

                      try {
                        const profileExists = await checkIfUserProfileExists();
                        if (!profileExists) {
                          await createUserProfile();
                          await sendWelcomeEmail(email as string);
                        }
                      } catch (error) {
                        throw new Error(
                          "Error while creating user profile: " + error
                        );
                      }

                      push(redirectUrl);
                    } catch (error) {
                      toast({
                        description: "Something went wrong while verifying OTP",
                        title: "Error",
                        variant: "destructive",
                      });
                    }
                  }
                })
              }
            >
              Confirm
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
