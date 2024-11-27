"use client";

import { QuestionType } from "@/app/components/question";
import { SubmissionType } from "./submissionView";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { updateSubmissionAnswers } from "@/app/api/submissions/mutations";
import { IoWarningOutline } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import { RxDotFilled } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import GradingForm from "./gradingForm";
import { FiEdit3 } from "react-icons/fi";
import SafeHTMLRenderer from "@/utils/htmlRenderer";

type submittedAnswerProps = {
  position: number;
  question: QuestionType;
  submissionData: SubmissionType;
};
export default function SubmittedAnswer(props: submittedAnswerProps) {
  const [isGrading, setIsGrading] = useState(false);
  const { refresh } = useRouter();
  const { toast } = useToast();

  return (
    <div
      key={props.question.id}
      className="relative w-full flex flex-col bg-white rounded-xl border border-black/30 overflow-clip"
    >
      <div className="flex flex-col p-5 gap-3">
        <p className="text-sm">
          Question {props.position}
          {" • "}
          <span className="text-xs text-black/70">
            {props.question.type === "multiple-choice"
              ? "Multiple Choice"
              : props.question.type === "long-answer"
              ? "Long Answer"
              : "Short Answer"}
          </span>
        </p>
        <p className="font-medium">
          <SafeHTMLRenderer htmlContent={props.question.content} />
        </p>
      </div>

      <div className={"relative p-3 border-t border-black/30"}>
        {props.submissionData.answers.find(
          (answer) =>
            answer.questionId === props.question.id &&
            answer.content &&
            props.question.answer.content
        ) ? (
          <div>
            <p className="text-sm underline underline-offset-4 mb-2">
              Submitted answer
            </p>
            <p className="text-sm font-light">
              {
                props.submissionData.answers.find(
                  (answer) => answer.questionId === props.question.id
                )?.content
              }
            </p>
          </div>
        ) : (
          !props.question.choices && (
            <p className="text-sm font-light">
              No answer has been submitted for this question
            </p>
          )
        )}
        {props.submissionData.answers.find(
          (answer) =>
            answer.questionId === props.question.id &&
            props.question.choices &&
            props.question.answer.choices &&
            answer.choices
        ) ? (
          <ul className="space-y-2">
            <p className="text-sm underline underline-offset-4 mb-2">
              Submitted choices
            </p>
            {props.question?.choices?.map((choice) => (
              <li
                key={choice}
                className={
                  props.submissionData.answers
                    .find((answer) => answer.questionId === props.question.id)
                    ?.choices?.includes(choice) &&
                  props.question.answer.choices?.includes(choice)
                    ? "text-green-600 text-sm flex flex-row gap-1"
                    : props.submissionData.answers
                        .find(
                          (answer) => answer.questionId === props.question.id
                        )
                        ?.choices?.includes(choice) &&
                      !props.question.answer.choices?.includes(choice)
                    ? "text-red-600 text-sm flex flex-row gap-1"
                    : "text-black/70 text-sm flex flex-row gap-1"
                }
              >
                {props.submissionData.answers
                  .find((answer) => answer.questionId === props.question.id)
                  ?.choices?.includes(choice) ? (
                  props.submissionData.answers
                    .find((answer) => answer.questionId === props.question.id)
                    ?.choices?.includes(choice) &&
                  props.question.answer.choices?.includes(choice) ? (
                    <FaCheck className="w-5 h-5" />
                  ) : (
                    <IoMdClose className="w-5 h-5" />
                  )
                ) : (
                  <RxDotFilled className="w-5 h-5 text-black/30" />
                )}
                <span className="w-[80%]">{choice}</span>
              </li>
            ))}
          </ul>
        ) : (
          !props.question.answer.content && (
            <p className="text-sm font-light">No choices have been submitted</p>
          )
        )}
      </div>

      {isGrading ? (
        <div className="flex flex-col gap-3 p-3 border-t border-black/30">
          <GradingForm
            question={props.question}
            answer={props.submissionData.answers.find(
              (answer) => answer.questionId === props.question.id
            )}
            onSubmit={async (data) => {
              try {
                props.submissionData.answers.find(
                  (answer) => answer.questionId === props.question.id
                )!.marks = data.marks;
                props.submissionData.answers.find(
                  (answer) => answer.questionId === props.question.id
                )!.comment = data.comment;

                await updateSubmissionAnswers(
                  props.submissionData.id,
                  props.submissionData.answers
                );

                setIsGrading(false);
                refresh();
              } catch (e) {
                toast({
                  description: "Something went wrong while updating the points",
                  title: "Error",
                  variant: "destructive",
                });
              }
            }}
            onCancel={() => setIsGrading(false)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-3 border-t border-black/30">
          {props.submissionData.answers.find(
            (answer) =>
              answer.questionId === props.question.id &&
              answer.marks != undefined
          ) ? (
            <p className="font-medium">
              Points:{" "}
              {
                props.submissionData.answers.find(
                  (answer) => answer.questionId === props.question.id
                )?.marks
              }
              /{props.question.marks}
            </p>
          ) : props.submissionData.answers.find(
              (answer) =>
                answer.questionId === props.question.id &&
                answer.marks == undefined
            ) ? (
            <div className="space-y-2">
              <p className="text-sm">No points given yet</p>

              <button
                className="w-fit flex flex-row px-2 py-1 items-center text-center text-sm text-black/70 gap-1 bg-black/5 border border-black/10 rounded-full"
                onClick={() => setIsGrading(true)}
              >
                <FiEdit3 />
                Give points
              </button>
            </div>
          ) : (
            <p className="flex flex-row items-center gap-3 text-sm p-3 bg-yellow-200 rounded-md">
              <IoWarningOutline className="min-w-5 min-h-5 w-5 h-5" />
              This question was recently created or updated and was not
              initially part of this submission. You will be able to grade it
              once it is submitted by the author of this submission
            </p>
          )}

          {props.submissionData.answers.find(
            (answer) =>
              answer.questionId === props.question.id && answer.comment
          ) && (
            <div>
              <p className="text-sm underline underline-offset-4 mb-2">
                Comment:
              </p>
              <p className="text-sm font-light">
                {
                  props.submissionData.answers.find(
                    (answer) => answer.questionId === props.question.id
                  )?.comment
                }
              </p>
            </div>
          )}

          {props.submissionData.answers.find(
            (answer) =>
              answer.questionId === props.question.id &&
              answer.marks != undefined
          ) && (
            <button
              className="w-fit flex flex-row px-2 py-1 items-center text-center text-sm text-black/70 gap-1 bg-black/5 border border-black/10 rounded-full"
              onClick={() => setIsGrading(true)}
            >
              <FiEdit3 />
              Edit points
            </button>
          )}
        </div>
      )}
    </div>
  );
}
