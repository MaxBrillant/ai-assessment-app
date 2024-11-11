"use client";

import { useSearchParams } from "next/navigation";
import LoginForm from "./loginForm";

export default function Login() {
  const urlParams = useSearchParams();

  let redirectUrl = urlParams.get("redirect")
    ? (urlParams.get("redirect") as string)
    : undefined;

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <div className="max-w-md rounded-3xl shadow-2xl">
        <LoginForm
          heading={"You need to login in order to continue"}
          redirectUrl={redirectUrl}
        />
      </div>
    </div>
  );
}
