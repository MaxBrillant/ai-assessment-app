"use client";

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
        window.close();
      }else{
        push("/login");
      }
    };
    checkForUser();
  });
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">Checking for User Authentication</h1>
    </div>
  );
}
