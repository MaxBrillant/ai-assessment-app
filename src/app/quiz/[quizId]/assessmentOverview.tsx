"use client";

import { checkIfCredentialsExists } from "@/app/api/submissions/fetch/getSubmissionData";
import { createSubmission } from "@/app/api/submissions/mutations";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiClock, FiUser } from "react-icons/fi";
import { IoIosArrowBack } from "react-icons/io";

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

    if (credentialsExist == undefined) {
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
          <div className="flex flex-col">
            <p>You are about to begin the following assessment:</p>
            <p className="text-xl font-bold my-2">{props.title}</p>
            <p className="flex gap-1 items-center text-sm">
              <FiUser className="w-4 h-4" />
              Created by {props.creatorEmail}
            </p>
            <p className="flex gap-1 items-center text-sm mt-1">
              <FiClock className="w-4 h-4" />
              {props.duration} minutes
            </p>
            {props.instructions && (
              <div className="my-4 flex flex-col gap-1 mt-6">
                <p className="text-sm underline underline-offset-4">
                  Provided instructions
                </p>
                <p className="text-sm">{props.instructions}</p>
              </div>
            )}
            <Button
              className="mt-8"
              onClick={() => {
                setStep(1);
              }}
            >
              Begin
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Button
              variant="secondary"
              className="w-fit"
              onClick={() => setStep(0)}
            >
              <IoIosArrowBack className="w-4 h-4" />
              Back
            </Button>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <p className="font-medium">
                {props.credentials.length > 0
                  ? "Enter the following credentials to proceed"
                  : "This assessment does not require any credentials, you are good to go"}
              </p>

              {props.credentials.length > 0 &&
                props.credentials.map((credential) => (
                  <div key={credential}>
                    <label
                      htmlFor={credential + "-credential"}
                      className="text-sm"
                    >
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
                          newCredentials[
                            props.credentials.indexOf(credential)
                          ] = e.target.value;
                          return newCredentials;
                        });
                      }}
                    />
                  </div>
                ))}

              {props.credentials.length > 0 && (
                <p className="text-xs -mb-6">
                  These credentials are requested by the creator of this
                  assessment
                </p>
              )}
              <Button type="submit" className="mt-4">
                Begin the assessment
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
