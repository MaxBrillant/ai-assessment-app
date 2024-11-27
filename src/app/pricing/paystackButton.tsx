"use client";
import { usePaystackPayment } from "react-paystack";
import {
  checkIfUserProfileExists,
  getLastPaymentDetails,
} from "../api/auth/getUserProfile";
import {
  createUserProfile,
  updateUserProfilePaymentDetails,
} from "../api/auth/createUserProfile";
import { getEnvVariable } from "@/utils/getEnvVariable";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { revalidatePath } from "next/cache";
import Loading from "../loading";
export default function PaystackButton(props: {
  email: string | undefined;
  userId: string | undefined;
  plan: "plus" | "pro";
  redirectUrl: string;
  children: ReactNode;
}) {
  const [publicKey, setPublicKey] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { replace, push } = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const getPublicKey = async () => {
      setPublicKey(await getEnvVariable("PAYSTACK_PUBLIC_KEY"));
    };
    getPublicKey();
  }, []);

  const initializePayment = usePaystackPayment({
    email: props.email,
    currency: "USD",
    amount: props.plan === "plus" ? 500 : 700,
    publicKey: publicKey!,
    metadata: {
      custom_fields: [
        {
          display_name: "Email",
          variable_name: "email",
          value: props.email,
        },
        {
          display_name: "Plan",
          variable_name: "plan",
          value: props.plan,
        },
      ],
    },
  });

  const onSuccess = async (reference: string) => {
    setIsLoading(true);
    try {
      const profileExists = await checkIfUserProfileExists();
      if (!profileExists) {
        await createUserProfile();
      }

      const lastPaymentDetails = await getLastPaymentDetails(
        props.userId as string
      );
      if (lastPaymentDetails.reference === reference) {
        toast({
          description: "Payment already processed",
          title: "Error",
          variant: "destructive",
        });
        setIsLoading(false);
      } else {
        await updateUserProfilePaymentDetails({
          credits: lastPaymentDetails.credits,
          plan: props.plan,
          userId: props.userId as string,
          reference: JSON.stringify(reference),
        });
        setIsLoading(false);
        toast({
          title: "Payment processed successfully",
        });

        push(props.redirectUrl);
      }
    } catch (error) {
      toast({
        description: "Something went wrong",
        title: "Error",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const onClose = () => {};
  return (
    <button
      onClick={() => {
        if (!props.email || !props.userId) {
          replace(
            "/login?redirect=" + window.location.href.replaceAll("&", "!")
          );
        } else {
          initializePayment({ onSuccess, onClose });
        }
      }}
    >
      {props.children}
      {isLoading && <Loading message="Processing your payment..." />}
    </button>
  );
}
