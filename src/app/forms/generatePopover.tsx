"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function GeneratePopover(props: {
  children: any;
  onSubmit: (newRequirement: string) => void;
}) {
  const [newRequirement, setNewRequirement] = useState<string | undefined>();
  const [open, setOpen] = useState(false);

  const onSubmit = () => {
    props.onSubmit(newRequirement as string);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      {open && (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-20 bg-black/20"></div>
      )}
      <PopoverContent className="z-30">
        <form className="flex flex-col gap-2">
          <p className="text-sm">What do you want to change or improve?</p>
          <Textarea
            placeholder="Write something here"
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            required
            minLength={1}
            maxLength={5000}
          />
          <Button
            type="submit"
            disabled={!newRequirement}
            onClick={(e) => {
              e.preventDefault();
              onSubmit();
              setOpen(false);
              setNewRequirement(undefined);
            }}
          >
            Generate
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
