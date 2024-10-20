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

  const onSubmit = () => {
    props.onSubmit(newRequirement as string);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      <PopoverContent>
        <form>
          <p>What do you want to change or improve?</p>
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
            }}
          >
            Generate
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
