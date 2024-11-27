"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export default function InstructionsDialog(props: { instructions: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"link"} className="w-fit underline px-0">
          Read instructions
        </Button>
      </DialogTrigger>
      <DialogContent>
        <p className="text-xl font-medium">Provided instructions</p>
        <p>{props.instructions}</p>
      </DialogContent>
    </Dialog>
  );
}
