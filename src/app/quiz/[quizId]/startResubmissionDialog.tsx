"use client";

import { startResubmission } from "@/app/api/submissions/mutations";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function StartResubmissionDialog(props: { id: number }) {
  const { refresh } = useRouter();
  const { toast } = useToast();

  return (
    <Dialog open>
      <DialogContent>
        <p className="text-2xl font-medium">
          New changes have been made to this assessment since you submitted it
        </p>
        <p>
          You can resubmit the assessment again. You will not be able to change
          your answers from your previous submission, only the questions that
          have been changed.
        </p>
        <Button
          onClick={async (e) => {
            e.preventDefault();

            const resubmission = await startResubmission(props.id);

            if (resubmission) {
              refresh();
            } else {
              toast({
                description: "Something went wrong while starting the resubmission",
                title: "Error",
                variant: "destructive",
              });
            }
          }}
        >
          Start resubmission
        </Button>
      </DialogContent>
    </Dialog>
  );
}
