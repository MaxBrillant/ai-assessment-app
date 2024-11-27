"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import PaystackButton from "./paystackButton";

export default function PricingOptions(props: {
  user: User | null;
  mode: "newUser" | "renewalOfCredits";
  onPlanSelection?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 items-center py-4">
      <h3 className="text-xl font-medium text-center">
        Pick the option that fits your needs
      </h3>
      <div
        className={`grid grid-cols-1 md:grid-cols-2
          ${
            props.mode === "newUser" ? "lg:grid-cols-3" : ""
          } items-center justify-center gap-6 p-4 px-6`}
      >
        {props.mode === "newUser" && (
          <div className="flex flex-col justify-between gap-6 w-full p-4 rounded-2xl bg-black/5 border border-black/30">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-lg font-medium">Free</p>
                <p className="text-2xl font-bold">$0</p>
              </div>
              <p>Start with 50 free credits to explore all our features</p>
              <Separator className="bg-black/10" />
              <ul className="text-sm">
                <li>• 50 credits</li>
                <li>• No credit card required</li>
              </ul>
            </div>
            <Link href={"/login?redirect=/create"}>
              <Button variant={"outline"} className="w-full">
                Get started for free
              </Button>
            </Link>
          </div>
        )}

        <div className="flex flex-col justify-between gap-6 w-full p-4 rounded-2xl  bg-primaryRed/5 border-4 border-primaryRed">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <p className="right-0 absolute top-0 bg-primaryRed text-white text-sm px-2 rounded-full">
                Popular
              </p>
              <p className="text-lg font-medium">Plus</p>
              <p className="text-2xl font-bold">$5</p>
            </div>
            <p>Get more done with extra credits</p>
            <Separator className="bg-black/10" />
            <ul className="text-sm">
              <li>• 200 credits</li>
            </ul>
          </div>
          <PaystackButton
            email={props.user?.email}
            userId={props.user?.id}
            plan={"plus"}
            redirectUrl={
              window.location.href.includes("/pricing")
                ? "/dashboard"
                : window.location.href
            }
          >
            <Button className="w-full" onClick={props.onPlanSelection}>
              {props.mode === "newUser" ? "Get started" : "Get credits"}
            </Button>
          </PaystackButton>
        </div>

        <div className="flex flex-col justify-between gap-6 w-full p-4 rounded-2xl bg-black/5 border border-black/30">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-lg font-medium">Pro</p>
              <p className="text-2xl font-bold">$7</p>
            </div>
            <p>
              Take your productivity to the next level with even more credits
            </p>
            <Separator className="bg-black/10" />
            <ul className="text-sm">
              <li>• 350 credits</li>
            </ul>
          </div>

          <PaystackButton
            email={props.user?.email}
            userId={props.user?.id}
            plan={"pro"}
            redirectUrl={
              window.location.href.includes("/pricing")
                ? "/dashboard"
                : window.location.href
            }
          >
            <Button
              variant={"outline"}
              className="w-full"
              onClick={props.onPlanSelection}
            >
              {props.mode === "newUser" ? "Get started" : "Get credits"}
            </Button>
          </PaystackButton>
        </div>
      </div>
    </div>
  );
}
