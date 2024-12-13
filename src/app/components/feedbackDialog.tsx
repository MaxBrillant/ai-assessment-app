"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

export default function FeedbackDialog() {
  const [open, setOpen] = useState(true);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col gap-2 p-4 max-w-sm">
        <p>What do you think about the results</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant={"ghost"}>I like it</Button>
          <Button variant={"ghost"}>{`I don't like it`}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
