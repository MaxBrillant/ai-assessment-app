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
import ExportSubmission from "./exportSubmission";
import { deleteSubmission } from "@/app/api/submissions/mutations";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import Loading from "@/app/loading";

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
  const [isAiGrading, setIsAiGrading] = useState(false);
  const { refresh } = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const getSubmission = async () => {
        try {
          const data = await getSubmissionData(
            props.assessmentId,
            props.submissionNanoId
          );
          setSubmissionData(data);
        } catch (e) {
          toast({
            description:
              "Something went wrong while getting the submission data",
            title: "Error",
            variant: "destructive",
          });
        }
      };
      getSubmission();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);
  return submissionData ? (
    <div>
      <div className="p-5 space-y-3 border-b border-black/50">
        {props.credentialLabels.map((label, index) => (
          <div
            className="flex flex-row gap-5 w-fit items-center justify-between"
            key={index}
          >
            <p className="w-28 text-sm font-light truncate">{label}</p>
            <p className="font-medium">{props.credentials[index]}</p>
          </div>
        ))}
        {submissionData.submissionTime && (
          <p className="text-sm font-light">
            Submitted on{" "}
            {formatDateAndTime(new Date(submissionData.submissionTime))}
          </p>
        )}

        <div className="flex flex-wrap gap-2 w-fit items-center">
          <Button
            onClick={async (e) => {
              e.preventDefault();
              setIsAiGrading(true);
              try {
                const grade = await gradeSubmission(
                  props.submissionNanoId,
                  props.questions,
                  submissionData.answers
                );
                toast({
                  title: "AI Grading completed successfully",
                });
                refresh();
              } catch (e) {
                toast({
                  description:
                    "Something went wrong while grading the submission",
                  title: "Error",
                  variant: "destructive",
                });
              }
              setIsAiGrading(false);
            }}
          >
            Grade with AI
          </Button>
          {isAiGrading && <Loading message="Grading the submission..." />}
          <ExportSubmission
            fileName={props.credentials.join("-")}
            questions={props.questions}
            answers={submissionData.answers}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant={"outline"}
                className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                Delete submission
              </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-4">
              <p className="text-lg font-medium">
                You are about to delete this submission. This action cannot be
                undone. Are you sure you want to proceed?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={"destructive"}
                  onClick={async () => {
                    try {
                      await deleteSubmission(submissionData.id);
                      toast({
                        title: "Submission deleted successfully",
                      });
                      refresh();
                    } catch (e) {
                      toast({
                        description:
                          "Something went wrong while deleting resubmission",
                        title: "Error",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Delete submission
                </Button>
                <DialogClose asChild>
                  <Button variant={"secondary"}>Cancel</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
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
    <Loading />
  );
}
