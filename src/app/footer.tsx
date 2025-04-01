import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="flex flex-col gap-6 p-6 bg-gradient-to-br from-primaryRed/5 to-primaryOrange/5 border-t border-black/30">
      <Link href={"/"}>
        <Image
          src={"/logo.svg"}
          width={160}
          height={56}
          className="w-40 h-14"
          alt="logo"
        />
      </Link>

      <ul className="flex flex-col gap-2">
        <li>
          <Link href={"/pricing"}>Pricing</Link>
        </li>
        <li>
          <Link href={"/#features"}>Features</Link>
        </li>
        <li>
          <Link href={"/#use-cases"}>Use cases</Link>
        </li>
        <li>
          <Link href={"/#faq"}>FAQ</Link>
        </li>
      </ul>
      <p className="text-sm">&copy; 2025 Quizdom Corp.</p>
    </div>
  );
}
