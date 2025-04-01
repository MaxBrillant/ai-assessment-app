import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import HamburgerMenu from "./hamburgerMenu";

export default function TopBar() {
  return (
    <section
      id="top-bar"
      className="sticky z-20 top-0 w-full flex justify-between items-center px-6 py-2 bg-white/50 backdrop-blur-sm"
    >
      <div className="flex gap-4 items-center">
        <Link href={"/"}>
          <Image
            src={"/logo.svg"}
            width={144}
            height={40}
            className="w-36 h-10"
            alt="logo"
          />
        </Link>
        <div className="hidden md:flex gap-1">
          <Link href={"/pricing"}>
            <Button variant={"link"} size={"sm"}>
              Pricing
            </Button>
          </Link>
          <a href="#features">
            <Button variant={"link"} size={"sm"}>
              Features
            </Button>
          </a>
          <a href="#use-cases">
            <Button variant={"link"} size={"sm"}>
              Use cases
            </Button>
          </a>
          <a href="#faq">
            <Button variant={"link"} size={"sm"}>
              FAQ
            </Button>
          </a>
        </div>
      </div>
      <div className="flex gap-2">
        <Link href="/login" className="hidden md:flex">
          <Button variant={"outline"}>Log in</Button>
        </Link>
        <HamburgerMenu />
      </div>
    </section>
  );
}
