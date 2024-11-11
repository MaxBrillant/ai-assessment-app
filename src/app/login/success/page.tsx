"use client";

import { CreateBrowserClient } from "@/utils/supabase/browserClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Login from "../page";

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
      } else {
        push("/login");
      }
    };
    checkForUser();
  });
  return <Login />;
}
