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
import { UpdateSubmissionAnswers } from "@/app/api/assessment/createSubmission";

type QuizFormProps = {
  id: number;
  questions: {
    id: number;
    type: "short-answer" | "long-answer" | "multiple-choice";
    content: string;
    marks: number;
    choices?: string[] | undefined;
  }[];
  defaultValues: answersType;
  submissionStatus: "pending-submission" | "submitted" | "resubmission-allowed";
};

const schema = submissionSchema.pick({ submission: true });
type SchemaType = z.infer<typeof schema>;
export default function QuizForm(props: QuizFormProps) {
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

  useEffect(() => {
    props.questions.map((question, index) => {
      setValue(`submission.${index}.questionId`, String(question.id));
    });

    // Set default values
    props.defaultValues.map((value) => {
      const correspondingQuestion = props.questions.find(
        (question) => String(question.id) === value.questionId
      );
      if (correspondingQuestion) {
        const index = props.questions.indexOf(correspondingQuestion as any);
        setValue(`submission.${index}.content`, value.content);
        setValue(`submission.${index}.choices`, value.choices);
      }
    });
  }, [props.questions]);

  const onSubmit = (data: SchemaType) => {
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-[40rem] p-5 mt-12 mx-auto space-y-4"
      disabled={
        props.submissionStatus === "resubmission-allowed" &&
        props.defaultValues.some(
          (defaultValue) =>
            defaultValue.questionId ===
            String(props.questions[currentQuestion].id)
        )}
    >
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
              setValue(`submission.${currentQuestion}.content`, value);
            }}
          />

          {errors.submission && errors.submission[currentQuestion]?.content && (
            <div className="p-3 bg-red-100/80 rounded-2xl">
              <p className="text-red-500 ">
                {errors.submission[currentQuestion]?.content.message}
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
              checked={watch(`submission.${currentQuestion}.choices`)?.includes(
                choice
              )}
              onChange={(e) => {
                if (e.target.checked) {
                  setValue(`submission.${currentQuestion}.choices`, [
                    ...(watch(`submission.${currentQuestion}.choices`) || []),
                    choice,
                  ]);
                } else {
                  setValue(
                    `submission.${currentQuestion}.choices`,
                    watch(`submission.${currentQuestion}.choices`)?.filter(
                      (c) => c !== choice
                    )
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
              {errors.submission[currentQuestion]?.choices.message}
            </p>
          </div>
        )}
      </ul>
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
              const trig = await trigger(`submission.${currentQuestion}.content`);

              if (
                trig &&
                !(errors.submission && errors.submission[currentQuestion]) &&
                currentQuestion <
                props.questions.length - 1
              ) {

                if(props.submissionStatus === "resubmission-allowed"){
                  
                }else{
                setCurrentQuestion(currentQuestion + 1);
                }
                const updateAnswers = await UpdateSubmissionAnswers(
                  props.id,
                  watch("submission")
                );

                if (updateAnswers) {
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
