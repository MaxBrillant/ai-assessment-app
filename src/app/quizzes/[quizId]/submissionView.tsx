"use client";

import { gradeSubmission } from "@/app/api/generate/grade/gradeSubmission";
import getSubmissionData from "@/app/api/submissions/fetch/getSubmissionData";
import { QuestionType } from "@/app/components/question";
import { answersType } from "@/app/validation/submissionValidation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDateAndTime } from "@/utils/formatDates";
import SubmittedAnswer from "./submittedAnswer";

export type SubmissionType = {
  id: number;
  nanoId: string;
  assessmentId: number;
  answers: answersType;
  submissionStatus:
    | "pending-submission"
    | "submitted"
    | "resubmission-allowed"
    | "graded";
  submissionTime: Date | undefined;
  created_at: Date;
  resubmissionStartedAt: Date | undefined;
};
export default function SubmissionView(props: {
  assessmentId: number;
  submissionNanoId: string;
  questions: QuestionType[];
  credentialLabels: string[];
  credentials: string[];
  submissionStatus: "submitted" | "graded";
}) {
  const [submissionData, setSubmissionData] = useState<
    SubmissionType | undefined
  >();
  const { refresh } = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const getSubmission = async () => {
      const data = await getSubmissionData(
        props.assessmentId,
        props.submissionNanoId
      );
      if (data) {
        setSubmissionData(data);
      } else {
        toast({
          description: "Something went wrong while getting the submission data",
          title: "Error",
          variant: "destructive",
        });
      }
    };
    getSubmission();
  }, []);
  return submissionData ? (
    <div>
      <div className="p-5 space-y-3 border-b border-black/50">
        {props.credentialLabels.map((label, index) => (
          <div className="flex flex-row gap-5 w-fit items-center justify-between">
            <p className="w-28 text-xs font-light truncate">{label}</p>
            <p className="font-medium">{props.credentials[index]}</p>
          </div>
        ))}
        {submissionData.submissionTime && (
          <p className="text-sm font-light">
            Submitted in{" "}
            {formatDateAndTime(new Date(submissionData.submissionTime))}
          </p>
        )}

        <div className="flex flex-wrap gap-2 w-fit items-center">
          <Button
            onClick={async (e) => {
              e.preventDefault();
              const grade = await gradeSubmission(
                props.submissionNanoId,
                props.questions,
                submissionData.answers
              );

              if (grade) {
                toast({
                  title: "AI Grading completed successfully",
                });
                refresh();
              } else {
                toast({
                  description:
                    "Something went wrong while grading the submission",
                  title: "Error",
                  variant: "destructive",
                });
              }
            }}
          >
            Grade with AI
          </Button>
          <Button variant={"outline"} size={"sm"}>
            Allow a resubmission
          </Button>
          <Button variant={"outline"} size={"sm"}>
            Export submission
          </Button>
        </div>
      </div>
      <div className="w-full flex flex-col p-5 gap-5 items-center bg-black/5">
        {props.questions.map((question, index) => {
          return (
            <SubmittedAnswer
              key={index + 1}
              position={index + 1}
              question={question}
              submissionData={submissionData}
            />
          );
        })}
      </div>
    </div>
  ) : (
    <div>Loading</div>
  );
}
