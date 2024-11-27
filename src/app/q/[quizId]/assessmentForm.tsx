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
import { useRouter } from "next/navigation";
import SafeHTMLRenderer from "@/utils/htmlRenderer";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

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
  const { refresh } = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    props.questions.forEach((question, index) => {
      setValue(`submission.${index}.questionId`, question.id);
    });

    // Set default values
    props.questions.forEach((question, index) => {
      const correspondingQuestion = props.defaultValues.find(
        (value) => question.id === value.questionId
      );
      if (correspondingQuestion) {
        setValue(`submission.${index}.content`, correspondingQuestion.content);
        setValue(`submission.${index}.choices`, correspondingQuestion.choices);
      }
    });

    const update = async () => {
      try {
        await updateSubmissionAnswers(props.id, watch(`submission`));
      } catch (e) {
        toast({
          description: "Something went wrong while saving your answer",
          title: "Error",
          variant: "destructive",
        });
      }
    };
    if (props.defaultValues.length === 0) {
      update();
    }
  }, [props.questions]);

  const onSubmit = async (data: SchemaType) => {
    console.log(data);

    if (props.submissionStatus === "resubmission-allowed") {
      try {
        await updateSubmissionAnswers(
          props.id,
          [...props.defaultValues, ...watch(`submission`)].filter(
            (answer, index, self) =>
              index ===
              self.findIndex((t) => t.questionId === answer.questionId)
          )
        );

        await submitAssessment(props.id);

        toast({
          title: "Assessment submitted successfully",
        });
        refresh();
      } catch (e) {
        toast({
          description: "Something went wrong while submitting the assessment",
          title: "Error",
          variant: "destructive",
        });
      }
    } else {
      try {
        await updateSubmissionAnswers(props.id, watch(`submission`));

        await submitAssessment(props.id);

        toast({
          title: "Assessment submitted successfully",
        });
        refresh();
      } catch (e) {
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
      <p className="text-center max-w-md mx-auto p-4 py-20 font-medium">
        No questions found
      </p>
    ) : (
      <p className="text-center max-w-md mx-auto p-4 py-20 font-medium">
        Your answers have been successfully submitted
      </p>
    )
  ) : (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-xl p-5 my-5 mx-auto"
    >
      <div>
        <div className="flex flex-col gap-3">
          <p className="mx-auto text-black/70 underline underline-offset-4">
            Question {currentQuestion + 1} out of {props.questions.length}
          </p>
          <p className="font-medium">
            <SafeHTMLRenderer
              htmlContent={props.questions[currentQuestion].content}
            />
          </p>
          <p className="text-sm font-light">
            {props.questions[currentQuestion].marks}{" "}
            {props.questions[currentQuestion].marks === 1 ? "point" : "points"}
          </p>
        </div>

        <div className="mt-4">
          {props.questions[currentQuestion].type !== "multiple-choice" && (
            <div>
              <TextEditor
                key={`${currentQuestion}-content`}
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

          {props.questions[currentQuestion].type === "multiple-choice" && (
            <ul className="flex flex-col divide-y divide-black/20 border border-black/20 rounded-lg overflow-hidden">
              {props.questions[currentQuestion].choices?.map(
                (choice, index) => (
                  <li
                    key={currentQuestion + "-" + index}
                    className={
                      (watch(`submission.${currentQuestion}.choices`)?.includes(
                        choice
                      )
                        ? "bg-primaryOrange/30 font-semibold "
                        : "") +
                      "flex text-sm text-black/70 gap-1 py-3 px-3 items-center cursor-pointer"
                    }
                    onClick={() => {
                      document
                        .getElementById(
                          "choice-" + currentQuestion + "-" + index
                        )
                        ?.click();
                    }}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      id={"choice-" + currentQuestion + "-" + index}
                      checked={watch(
                        `submission.${currentQuestion}.choices`
                      )?.includes(choice)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setValue(`submission.${currentQuestion}.choices`, [
                            ...(watch(
                              `submission.${currentQuestion}.choices`
                            ) || []),
                            choice,
                          ]);
                        } else {
                          setValue(
                            `submission.${currentQuestion}.choices`,
                            watch(`submission.${currentQuestion}.choices`) &&
                              watch(`submission.${currentQuestion}.choices`)!
                                .length > 1
                              ? watch(
                                  `submission.${currentQuestion}.choices`
                                )?.filter((c) => c !== choice)
                              : undefined
                          );
                        }
                      }}
                    />
                    <p className="flex items-center justify-center w-8 h-8 p-3 border border-black/20 rounded-full bg-black/5 mr-2">
                      {String.fromCharCode(65 + index).toUpperCase()}
                    </p>
                    <p className="flex-grow text-sm text-left">{choice}</p>
                  </li>
                )
              )}
              {errors.submission &&
                errors.submission[currentQuestion]?.choices && (
                  <div className="p-3 bg-red-100/80 rounded-2xl">
                    <p className="text-red-500 ">
                      {errors.submission[currentQuestion]?.choices?.message}
                    </p>
                  </div>
                )}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {currentQuestion > 0 && (
          <Button
            variant={"outline"}
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
            variant={"secondary"}
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

                setTimeout(async () => {
                  if (props.submissionStatus === "resubmission-allowed") {
                  } else {
                    try {
                      await updateSubmissionAnswers(
                        props.id,
                        watch(`submission`)
                      );
                    } catch (e) {
                      toast({
                        description:
                          "Something went wrong while saving your answer",
                        title: "Error",
                        variant: "destructive",
                      });
                    }
                  }
                }, 100);
              }
            }}
          >
            Save & Continue
          </Button>
        )}
        {currentQuestion === props.questions.length - 1 && (
          <Button type="submit">Submit</Button>
        )}
      </div>
    </form>
  );
}
