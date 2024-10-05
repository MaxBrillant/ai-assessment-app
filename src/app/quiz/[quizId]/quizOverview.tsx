"use client";

import { CreateSubmission } from "@/app/api/assessment/createSubmission";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

type quizProps = {
  id: number;
  title: string;
  duration: number;
  instructions: string | undefined;
  credentials: string[];
};
export default function QuizOverview(props: quizProps) {
  const [step, setStep] = useState(0);
  const [credentials, setCredentials] = useState<string[]>(
    props.credentials.map(() => "")
  );
  const { push } = useRouter();

  return (
    <Dialog open={true}>
      <DialogContent>
        {step === 0 ? (
          <div>
            <p>You are about to begin the following assessment</p>
            <p className="text-2xl font-bold">{props.title}</p>
            <p>Duration: {props.duration} minutes</p>
            <p>Created by Max</p>
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
            <form>
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
              <Button
                onClick={async (e) => {
                  e.preventDefault();
                  const submissionNanoId = await CreateSubmission(
                    props.id,
                    credentials
                  );
                  if (submissionNanoId) {
                    push(location.href + "?submissionId=" + submissionNanoId);
                  }
                }}
              >
                Begin the assessment
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
