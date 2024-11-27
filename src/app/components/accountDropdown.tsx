"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import { FiLogOut } from "react-icons/fi";
import PricingOptions from "../pricing/pricingOptions";
import { Suspense, useEffect, useState } from "react";
import { getLastPaymentDetails } from "../api/auth/getUserProfile";
import { CreateBrowserClient } from "@/utils/supabase/browserClient";

export default function AccountDropdown(props: { user: User }) {
  const [userCredits, setUserCredits] = useState<number | undefined>();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const getUserCredits = async () => {
      const paymentDetails = await getLastPaymentDetails(props.user.id);
      setUserCredits(paymentDetails.credits);
    };

    getUserCredits();
  }, [props.user.id]);

  return (
    <div>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primaryRed/10 border border-black/70 text-center">
            {props.user.user_metadata.avatar_url ? (
              <Image
                src={props.user.user_metadata.avatar_url}
                width={40}
                height={40}
                alt="avatar"
                className="w-full h-full rounded-full"
              />
            ) : props.user.user_metadata.name ? (
              <p>{props.user.user_metadata.name.charAt(0).toUpperCase()}</p>
            ) : (
              <p>{props.user.email?.charAt(0).toUpperCase()}</p>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <div className="min-w-48 flex flex-col gap-2 p-4 items-center">
            <p className="font-medium">
              {props.user.user_metadata.name || props.user.email}
            </p>
            <Separator />
            <p className="text-sm">Credit balance</p>
            {
              <Suspense
                fallback={
                  <div className="h-6 w-12 bg-black/10 animate-pulse"></div>
                }
              >
                <p className="font-bold text-2xl">{userCredits}</p>
              </Suspense>
            }
            <Button
              className="w-full"
              onClick={() => {
                setOpen(false);
                setDialogOpen(true);
              }}
            >
              Add credits
            </Button>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              const supabase = await CreateBrowserClient();
              await supabase.auth.signOut();
              window.location.href = window.location.origin;
            }}
          >
            <FiLogOut className="w-5 h-5 mr-3" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <PricingOptions
            user={props.user}
            mode="renewalOfCredits"
            onPlanSelection={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
