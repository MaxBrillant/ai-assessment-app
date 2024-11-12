"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { loginWithEmail, loginWithGoogle, verifyOTP } from "./actions";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CreateBrowserClient } from "@/utils/supabase/browserClient";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import Loading from "../loading";

export default function LoginForm(props: {
  heading: string;
  redirectUrl: string | undefined;
}) {
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [otp, setOTP] = useState<string | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { push } = useRouter();

  let redirectUrl = props.redirectUrl
    ? props.redirectUrl?.includes("http")
      ? (props.redirectUrl as string)
      : location.origin + (props.redirectUrl as string)
    : location.origin + "/quizzes";

  useEffect(() => {
    const checkForAuthenticatedUser = async () => {
      setIsLoading(true);
      const supabase = await CreateBrowserClient();

      const authenticatedUser = await supabase.auth
        .getUser()
        .then((user) => user.data.user);

      if (authenticatedUser) {
        push(redirectUrl as string);
      }

      setIsLoading(false);
    };
    checkForAuthenticatedUser();
  }, []);

  return (
    <div className="flex flex-col gap-5 mx-auto items-center max-w-sm p-7">
      <p className="text-lg font-bold">{props.heading}</p>
      <button
        className="p-4 bg-black/5 rounded-lg flex gap-2 items-center justify-center text-black/80 hover:bg-black/10"
        onClick={async () => {
          if (redirectUrl) {
            setIsLoading(true);
            const url = await loginWithGoogle(redirectUrl).catch((error) => {
              setIsLoading(false);
              toast({
                description:
                  "Something went wrong while logging in with Google",
                title: "Error",
                variant: "destructive",
              });
            });

            if (url) {
              setIsLoading(true);
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
                    setIsLoading(false);
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
        <FcGoogle className="w-5 h-5" />
        Continue with Google
      </button>
      {isLoading && <Loading />}
      {/* <p>or</p>
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
      </Button> */}

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
