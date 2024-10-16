"use client";

import { gradeSubmission } from "@/app/api/generate/grade/gradeSubmission";
import getSubmissionData from "@/app/api/submissions/fetch/getSubmissionData";
import { QuestionType } from "@/app/components/question";
import { answersType } from "@/app/validation/submissionValidation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheckSquare } from "react-icons/fa";
import { MdCheckBoxOutlineBlank } from "react-icons/md";

type submissionType = {
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
    submissionType | undefined
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
      {props.credentialLabels.map((label, index) => (
        <div>
          <p>{label + ": " + props.credentials[index]}</p>
        </div>
      ))}
      {submissionData.submissionTime && (
        <p>
          Submitted at: {new Date(submissionData.submissionTime).toISOString()}
        </p>
      )}
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
              description: "Something went wrong while grading the submission",
              title: "Error",
              variant: "destructive",
            });
          }
        }}
      >
        Grade with AI
      </Button>
      <Button>Allow a resubmission</Button>
      <Button>Print submission</Button>
      {props.questions.map((question, index) => (
        <div key={question.id}>
          <p>Question {index + 1}</p>
          <p>{question.content}</p>
          <p>Answer:</p>
          {submissionData.answers.find(
            (answer) =>
              answer.questionId === question.id &&
              answer.content &&
              question.answer.content
          ) && (
            <p>
              {
                submissionData.answers.find(
                  (answer) => answer.questionId === question.id
                )?.content
              }
            </p>
          )}
          {submissionData.answers.find(
            (answer) =>
              answer.questionId === question.id &&
              question.choices &&
              question.answer.choices &&
              answer.choices
          ) && (
            <ul>
              {question?.choices?.map((choice) => (
                <li
                  key={choice}
                  className={
                    submissionData.answers
                      .find((answer) => answer.questionId === question.id)
                      ?.choices?.includes(choice) &&
                    question.answer.choices?.includes(choice)
                      ? "text-green-500 font-bold flex flex-row gap-1"
                      : submissionData.answers
                          .find((answer) => answer.questionId === question.id)
                          ?.choices?.includes(choice) &&
                        !question.answer.choices?.includes(choice)
                      ? "text-red-500 font-bold flex flex-row gap-1"
                      : " flex flex-row gap-1"
                  }
                >
                  {submissionData.answers
                    .find((answer) => answer.questionId === question.id)
                    ?.choices?.includes(choice) ? (
                    <FaCheckSquare className="w-5 h-5 mt-1" />
                  ) : (
                    <MdCheckBoxOutlineBlank className="w-5 h-5 mt-1" />
                  )}
                  <span className="w-[80%]">{choice}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div>Loading</div>
  );
}
