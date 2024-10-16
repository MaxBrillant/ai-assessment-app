"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithEmail, loginWithGoogle, verifyOTP } from "./actions";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CreateBrowserClient } from "@/utils/supabase/browserClient";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [otp, setOTP] = useState<string | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWaitingGoogleSignIn, setIsWaitingGoogleSignIn] = useState(false);
  const { toast } = useToast();

  const { push } = useRouter();
  const urlParams = useSearchParams();

  let redirectUrl: string | undefined;
  useEffect(() => {
    redirectUrl = urlParams.get("redirect")
      ? urlParams.get("redirect")?.includes("http")
        ? (urlParams.get("redirect") as string)
        : location.origin + (urlParams.get("redirect") as string)
      : location.origin;

    const checkForAuthenticatedUser = async () => {
      const supabase = await CreateBrowserClient();

      const authenticatedUser = await supabase.auth
        .getUser()
        .then((user) => user.data.user);

      if (authenticatedUser) {
        push(redirectUrl as string);
      }
    };
    checkForAuthenticatedUser();
  }, [urlParams]);

  return (
    <div className="flex flex-col gap-5 mx-auto mt-32 items-center max-w-80 p-7 rounded-3xl shadow-2xl">
      <h1>You need to login in order to continue</h1>
      <button
        onClick={async () => {
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
                  const supabase = await CreateBrowserClient();

                  const authenticatedUser = await supabase.auth
                    .getUser()
                    .then((user) => user.data.user);

                  if (authenticatedUser) {
                    clearInterval(intervalId);
                    push(redirectUrl as string);
                  }
                  return () => {
                    clearInterval(intervalId);
                  };
                };
                intervalId = setInterval(checkForAuthenticatedUser, 10000);
              }
            }
          }
        }}
      >
        Continue with Google
      </button>
      <p>or</p>
      <label htmlFor="email">Email Address</label>
      <Input
        type="email"
        placeholder="max@example.com"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      ></Input>
      <Button
        disabled={!email || email.length < 5 || !email.includes("@")}
        onClick={async () => {
          if (email) {
            await loginWithEmail(email)
              .then(() => {
                setIsDialogOpen(true);
              })
              .catch((error) => {
                toast({
                  description:
                    "Something went wrong while logging in with email",
                  title: "Error",
                  variant: "destructive",
                });
              });
          }
        }}
      >
        Continue
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <p>We have sent a verification code to {email}</p>
          <p>Write the code below</p>
          <Input
            placeholder="123456"
            type="number"
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
          ></Input>
          <Button
            onClick={async () => {
              if (redirectUrl && email && otp) {
                await verifyOTP(email, otp, redirectUrl).catch((error) => {
                  toast({
                    description: "Something went wrong while verifying OTP",
                    title: "Error",
                    variant: "destructive",
                  });
                });
              }
            }}
          >
            Confirm
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
