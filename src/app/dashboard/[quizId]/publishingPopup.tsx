"use client";
import { publishAssessment } from "@/app/api/assessments/mutations";
import RulesForm from "@/app/forms/rulesForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { FiSend } from "react-icons/fi";

export default function PublishingPopup(props: { id: number; title: string }) {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const { push } = useRouter();
  const { toast } = useToast();

  return (
    <div>
      <Dialog open={isRulesOpen} onOpenChange={setIsRulesOpen}>
        <DialogTrigger asChild>
          <Button className="w-fit gap-1 items-center" size={"lg"}>
            <FiSend className="w-5 h-5" />
            Publish and share
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[100vh] overflow-auto">
          <p className="text-xl">Publish and share</p>
          <RulesForm
            defaultValues={{
              title: props.title,
              instructions: undefined,
              duration: "60",
              credentials: ["Email address", "Full name"],
            }}
            mode="create"
            onSubmit={async (data) => {
              try {
                const publishedAssessment = await publishAssessment(
                  props.id,
                  data.title,
                  data.duration,
                  data.instructions,
                  data.credentials
                );
                setIsRulesOpen(false);
                toast({
                  title: "Your assessment has been published",
                });
                push(`/dashboard/${publishedAssessment}?share=true`);
              } catch (err) {
                toast({
                  description:
                    "Something went wrong while publishing your assessment",
                  title: "Error",
                  variant: "destructive",
                });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
