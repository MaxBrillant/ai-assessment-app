"use client";

import { checkIfCredentialsExists } from "@/app/api/submissions/fetch/getSubmissionData";
import { createSubmission } from "@/app/api/submissions/mutations";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

type assessmentProps = {
  id: number;
  creatorEmail: string;
  title: string;
  duration: number;
  instructions: string | undefined;
  credentials: string[];
};
export default function AssessmentOverview(props: assessmentProps) {
  const [step, setStep] = useState(0);
  const [credentials, setCredentials] = useState<string[]>(
    props.credentials.map(() => "")
  );
  const { push } = useRouter();
  const { toast } = useToast();

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const credentialsExist = await checkIfCredentialsExists(
      props.id,
      credentials[0]
    );

    if (credentialsExist === undefined) {
      toast({
        description: "Something went wrong while checking credentials",
        title: "Error",
        variant: "destructive",
      });
    } else {
      if (credentialsExist === false) {
        const submissionNanoId = await createSubmission(props.id, credentials);
        if (submissionNanoId) {
          push(location.href + "?submissionId=" + submissionNanoId);
        } else {
          toast({
            description: "Something went wrong while creating your submission",
            title: "Error",
            variant: "destructive",
          });
        }
      } else {
        toast({
          description: `The ${props.credentials[0]} "${credentials[0]}" is already in use. Try a different ${props.credentials[0]}`,
          title: "Error",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent>
        {step === 0 ? (
          <div>
            <p>You are about to begin the following assessment</p>
            <p className="text-2xl font-bold">{props.title}</p>
            <p>Duration: {props.duration} minutes</p>
            <p>Created by {props.creatorEmail}</p>
            {props.instructions && (
              <div>
                <p>Provided instructions</p>
                <p>{props.instructions}</p>
              </div>
            )}
            <Button
              onClick={() => {
                if (props.credentials.length > 0) {
                  setStep(1);
                }
              }}
            >
              Begin
            </Button>
          </div>
        ) : (
          <div>
            <Button onClick={() => setStep(0)}>Back</Button>
            <form onSubmit={onSubmit}>
              <p>Enter the following credentials to proceed</p>
              {props.credentials.map((credential) => (
                <div>
                  <label htmlFor={credential + "-credential"}>
                    {credential}
                  </label>
                  <Input
                    type="text"
                    id={credential + "-credential"}
                    placeholder={`Write your ${credential} here`}
                    maxLength={100}
                    minLength={1}
                    required
                    value={credentials[props.credentials.indexOf(credential)]}
                    onChange={(e) => {
                      setCredentials((prev) => {
                        const newCredentials = [...prev];
                        newCredentials[props.credentials.indexOf(credential)] =
                          e.target.value;
                        return newCredentials;
                      });
                    }}
                  />
                </div>
              ))}
              <Button type="submit">Begin the assessment</Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
