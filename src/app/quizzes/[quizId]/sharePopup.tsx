"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { IoShareOutline } from "react-icons/io5";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
export default function SharePopup(props: { nanoId: string }) {
  const [isPublished, setIsPublished] = useState(false);
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get("share")) {
      setIsPublished(true);
    }
  }, [searchParams]);
  return (
    <div>
      <Dialog open={isPublished} onOpenChange={setIsPublished}>
        <DialogContent>
          <p className="text-xl font-semibold">Share with others</p>
          <div className="flex flex-col gap-3 p-4 mx-4 bg-black/5 rounded-xl border border-black/30">
            <p className="font-medium text-black">
              Share this assessment with anyone, anytime, for instant access and
              completion
            </p>

            <div className="flex flex-row">
              <Input
                disabled
                className="flex-grow"
                value={window.location.origin + "/quiz/" + props.nanoId}
              />
              <Button
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    window.location.origin + "/quiz/" + props.nanoId
                  );
                  toast({
                    title: "Copied to clipboard",
                  });
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
