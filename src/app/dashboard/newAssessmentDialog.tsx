"use client";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import FilePicker from "../components/filePicker";
import { Button } from "@/components/ui/button";
import { FiPlus } from "react-icons/fi";

export default function NewAssessmentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => open === true && setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button>
          <span>
            <FiPlus className="w-5 h-5 mr-2" />
          </span>
          New
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-2 p-4">
        <h3 className="text-xl font-bold">Create new assessment</h3>

        <Button
          onClick={() => setIsOpen(false)}
          variant={"secondary"}
          className="z-10 focus:bg-white hover:bg-white bg-white absolute top-2 right-2"
        >
          Close
        </Button>
        <div className="flex p-8">
          <FilePicker />
        </div>
      </DialogContent>
    </Dialog>
  );
}
