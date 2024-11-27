"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { getLastPaymentDetails } from "../api/auth/getUserProfile";
import { CreateBrowserClient } from "@/utils/supabase/browserClient";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import PricingOptions from "../pricing/pricingOptions";
import { User } from "@supabase/supabase-js";

export default function GeneratePopover(props: {
  children: any;
  onSubmit: (newRequirement: string) => void;
}) {
  const [user, setUser] = useState<User | undefined>();
  const [newRequirement, setNewRequirement] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const [userCredits, setUserCredits] = useState<number | undefined>();

  useEffect(() => {
    const getUserCredits = async () => {
      const supabase = await CreateBrowserClient();
      const userId = (await supabase.auth.getUser()).data.user?.id as string;
      const paymentDetails = await getLastPaymentDetails(userId);
      setUserCredits(paymentDetails.credits);
    };
    const getUserId = async () => {
      const supabase = await CreateBrowserClient();
      const user = (await supabase.auth.getUser()).data.user as User;
      setUser(user);
    };

    getUserId();
    getUserCredits();
  }, []);

  const onSubmit = () => {
    props.onSubmit(newRequirement as string);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      {open && (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-20 bg-black/20"></div>
      )}
      <PopoverContent className="z-30">
        <form className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            What do you want to change or improve?
          </p>
          <Textarea
            placeholder="Write something here"
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            required
            minLength={1}
            maxLength={5000}
          />
          {userCredits && userCredits > 1 ? (
            <Button
              type="submit"
              disabled={!userCredits}
              onClick={(e) => {
                e.preventDefault();
                onSubmit();
                setOpen(false);
                setNewRequirement(undefined);
              }}
            >
              {newRequirement ? "Generate" : "Try again"}
            </Button>
          ) : (
            user && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    {newRequirement ? "Generate" : "Try again"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <PricingOptions user={user} mode="renewalOfCredits" />
                </DialogContent>
              </Dialog>
            )
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
}
