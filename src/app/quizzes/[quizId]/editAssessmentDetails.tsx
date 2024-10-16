"use client";

import { updateAssessmentRules } from "@/app/api/assessments/mutations";
import RulesForm from "@/app/forms/rulesForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditAssessmentDetails(props: {
  id: number;
  title: string;
  duration: number;
  instructions: string | undefined;
  credentials: string[];
}) {
  const [open, setOpen] = useState(false);
  const { push } = useRouter();
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-fit">Edit assessment details</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[100vh] overflow-auto">
        <RulesForm
          defaultValues={{
            title: props.title,
            duration: String(props.duration) as any,
            instructions: props.instructions,
            credentials: props.credentials,
          }}
          mode="update"
          onSubmit={async (data) => {
            const updateRules = await updateAssessmentRules(
              props.id,
              data.title,
              data.duration,
              data.instructions
            );

            if (updateRules) {
              toast({
                title: "Assessment details updated successfully",
              });
              setOpen(false);
              push(location.href);
            } else {
              toast({
                description:
                  "Something went wrong while updating the assessment details",
                title: "Error",
                variant: "destructive",
              });
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
