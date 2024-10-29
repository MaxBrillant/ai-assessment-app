"use client";

import {
  answersType,
  submissionSchema,
} from "@/app/validation/submissionValidation";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import TextEditor from "@/app/components/textEditor";
import {
  submitAssessment,
  updateSubmissionAnswers,
} from "@/app/api/submissions/mutations";
import { useToast } from "@/hooks/use-toast";

type AssessmentFormProps = {
  id: number;
  questions: {
    id: string;
    type: "short-answer" | "long-answer" | "multiple-choice";
    content: string;
    marks: number;
    choices?: string[] | undefined;
  }[];
  defaultValues: answersType;
  submissionStatus:
    | "pending-submission"
    | "submitted"
    | "resubmission-allowed"
    | "graded";
};

const schema = submissionSchema.pick({ submission: true });
type SchemaType = z.infer<typeof schema>;

export default function AssessmentForm(props: AssessmentFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<SchemaType>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    console.log(watch(`submission.${currentQuestion}.content`));
  }, [currentQuestion]);
  useEffect(() => {
    props.questions.map((question, index) => {
      setValue(`submission.${index}.questionId`, question.id);
    });

    // Set default values
    props.questions.map((question, index) => {
      const correspondingQuestion = props.defaultValues.find(
        (value) => question.id === value.questionId
      );
      if (correspondingQuestion) {
        setValue(`submission.${index}.content`, correspondingQuestion.content);
        setValue(`submission.${index}.choices`, correspondingQuestion.choices);
      }
    });
  }, [props.questions]);

  const onSubmit = async (data: SchemaType) => {
    console.log(data);

    if (props.submissionStatus === "resubmission-allowed") {
      const updateAnswers = await updateSubmissionAnswers(
        props.id,
        [...props.defaultValues, ...watch(`submission`)].filter(
          (answer, index, self) =>
            index === self.findIndex((t) => t.questionId === answer.questionId)
        )
      );

      const submit = await submitAssessment(props.id);

      if (submit) {
        toast({
          title: "Assessment submitted successfully",
        });
      } else {
        toast({
          description: "Something went wrong while submitting the assessment",
          title: "Error",
          variant: "destructive",
        });
      }
    } else {
      const updateAnswers = await updateSubmissionAnswers(
        props.id,
        watch(`submission`)
      );

      const submit = await submitAssessment(props.id);

      if (submit) {
        toast({
          title: "Assessment submitted successfully",
        });
      } else {
        toast({
          description: "Something went wrong while submitting the assessment",
          title: "Error",
          variant: "destructive",
        });
      }
    }
  };

  return props.questions.length === 0 ||
    props.submissionStatus === "submitted" ? (
    props.questions.length === 0 ? (
      <p>No questions found</p>
    ) : (
      <p>Your answers have been submitted</p>
    )
  ) : (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-[40rem] p-5 mt-12 mx-auto space-y-4"
    >
      <div>
        <p className="text-2xl font-medium">
          Question {currentQuestion + 1}/{props.questions.length}
        </p>
        <p>{props.questions[currentQuestion].content}</p>
        <p className="font-medium">
          {props.questions[currentQuestion].marks}{" "}
          {props.questions[currentQuestion].marks === 1 ? "mark" : "marks"}
        </p>
        {props.questions[currentQuestion].type !== "multiple-choice" && (
          <div>
            <TextEditor
              value={watch(`submission.${currentQuestion}.content`)}
              onChange={(value) => {
                setValue(
                  `submission.${currentQuestion}.content`,
                  (value as string).replace(/<[^>]*>/g, "") === ""
                    ? undefined
                    : value
                );
              }}
              isTextArea={true}
              placeholder={"Write your answer here"}
            />

            {errors.submission &&
              errors.submission[currentQuestion]?.content && (
                <div className="p-3 bg-red-100/80 rounded-2xl">
                  <p className="text-red-500 ">
                    {errors.submission[currentQuestion]?.content?.message}
                  </p>
                </div>
              )}
          </div>
        )}

        <ul className="flex flex-col gap-5 p-3">
          {props.questions[currentQuestion].choices?.map((choice, index) => (
            <li key={index}>
              <input
                type="checkbox"
                className="mr-2"
                id={index + ""}
                checked={watch(
                  `submission.${currentQuestion}.choices`
                )?.includes(choice)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setValue(`submission.${currentQuestion}.choices`, [
                      ...(watch(`submission.${currentQuestion}.choices`) || []),
                      choice,
                    ]);
                  } else {
                    setValue(
                      `submission.${currentQuestion}.choices`,
                      watch(`submission.${currentQuestion}.choices`) &&
                        watch(`submission.${currentQuestion}.choices`)!.length >
                          2
                        ? watch(
                            `submission.${currentQuestion}.choices`
                          )?.filter((c) => c !== choice)
                        : undefined
                    );
                  }
                  console.log(watch());
                }}
              />
              <label htmlFor={index + ""}>{choice}</label>
            </li>
          ))}
          {errors.submission && errors.submission[currentQuestion]?.choices && (
            <div className="p-3 bg-red-100/80 rounded-2xl">
              <p className="text-red-500 ">
                {errors.submission[currentQuestion]?.choices?.message}
              </p>
            </div>
          )}
        </ul>
      </div>
      <p className="text-sm text-gray-700">
        Your answers are automatically saved on your browser
      </p>

      <div className="flex flex-wrap gap-3">
        {currentQuestion > 0 && (
          <Button
            onClick={(e) => {
              e.preventDefault();
              if (currentQuestion > 0) {
                setCurrentQuestion(currentQuestion - 1);
              }
            }}
          >
            Previous Question
          </Button>
        )}
        {currentQuestion < props.questions.length - 1 && (
          <Button
            onClick={async (e) => {
              e.preventDefault();
              const trig = await trigger(
                `submission.${currentQuestion}.content`
              );

              if (
                trig &&
                !(errors.submission && errors.submission[currentQuestion]) &&
                currentQuestion < props.questions.length - 1
              ) {
                setCurrentQuestion(currentQuestion + 1);

                if (props.submissionStatus === "resubmission-allowed") {
                } else {
                  const updateAnswers = await updateSubmissionAnswers(
                    props.id,
                    watch(`submission`)
                  );
                }
              }
            }}
          >
            Next Question
          </Button>
        )}
        {currentQuestion === props.questions.length - 1 && (
          <Button type="submit">Submit your answers</Button>
        )}
      </div>
    </form>
  );
}
