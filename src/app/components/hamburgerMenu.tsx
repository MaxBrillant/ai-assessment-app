"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { RxHamburgerMenu } from "react-icons/rx";

export default function HamburgerMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant={"outline"}
          size={"icon"}
          className="md:hidden rounded-full p-2"
        >
          <RxHamburgerMenu className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Link href={"/pricing"}>
          <DropdownMenuItem>Pricing</DropdownMenuItem>
        </Link>
        <Link href={"/#features"}>
          <DropdownMenuItem>Features</DropdownMenuItem>
        </Link>
        <Link href={"/#use-cases"}>
          <DropdownMenuItem>Use cases</DropdownMenuItem>
        </Link>
        <Link href={"/#faq"}>
          <DropdownMenuItem>FAQ</DropdownMenuItem>
        </Link>
        <Link href="/login">
          <DropdownMenuItem>Log in</DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
