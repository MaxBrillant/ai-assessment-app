"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { sendFeedbackEmail } from "../api/email/sendEmail";
import { CreateBrowserClient } from "@/utils/supabase/browserClient";
import { useToast } from "@/hooks/use-toast";

export default function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className="border-primaryRed bg-white hover:bg-primaryRed hover:text-white"
        >
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-2 p-4 max-w-sm">
        <h3 className="text-xl font-bold">
          Tell us what you think about Quizdom
        </h3>
        <p className="text-sm text-muted-foreground">
          Your feedback helps us improve our product and serve you better.
        </p>
        <Textarea
          placeholder="Type your feedback here..."
          className="mt-4"
          onChange={(e) => setFeedback(e.target.value)}
        />
        <Button
          className="w-full"
          disabled={!feedback}
          onClick={async () => {
            const supabase = await CreateBrowserClient();
            const userEmail = (await supabase.auth.getUser()).data.user?.email;
            await sendFeedbackEmail(
              userEmail ? (userEmail as string) : "Unauthenticated user",
              feedback
            ).then(() => {
              toast({
                title: "Feedback sent successfully!",
              });
              setFeedback("");
              setOpen(false);
            });
          }}
        >
          Submit
        </Button>
      </DialogContent>
    </Dialog>
  );
}
