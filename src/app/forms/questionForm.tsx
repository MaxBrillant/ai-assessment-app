"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { questionSchema } from "../validation/questionValidation";
import { z } from "zod";
import { useContext, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MdDeleteOutline } from "react-icons/md";
import { QuestionType } from "../components/question";
import { TbReload } from "react-icons/tb";

type QuestionSchemaType = z.infer<typeof questionSchema>;
type QuestionFormType = QuestionType & {
  onSubmit: (data: QuestionSchemaType) => void;
  onQuestionGenerationRequest: (
    currentlySelectedType: "short-answer" | "multiple-choice" | "long-answer"
  ) => void;
  onAnswerGenerationRequest: (
    currentAnswer: string | undefined,
    currentQuestion: string,
    currentlySelectedType: "short-answer" | "long-answer"
  ) => void;
};
export default function QuestionForm(props: QuestionFormType) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuestionSchemaType>({
    resolver: zodResolver(questionSchema),
    defaultValues: props,
    reValidateMode: "onChange",
  });

  const [choices, setChoices] = useState<string[]>(
    props.choices ? props.choices : []
  );

  useEffect(() => {
    if (watch("type") === "short-answer" || watch("type") === "long-answer") {
      setValue("choices", undefined);
      setValue("answer.choices", undefined);
    } else {
      setValue("answer.content", undefined);
      setValue("choices", choices);
      setValue(
        "answer.choices",
        watch("answer.choices") ? watch("answer.choices") : []
      );
    }
  }, [watch("type")]);

  // useEffect(() => {
  //   if (watch("type") === "multiple-choice") {
  //     setValue("choices", choices);
  //   }
  // }, [choices]);

  const errorMessages = Object.values(errors).flatMap((error: any) => {
    if (Array.isArray(error)) {
      const arrayErrors = error.map((arrayError: any) => arrayError.message);
      return arrayErrors;
    } else {
      return [
        error.choices
          ? error.choices.message
          : error.content
          ? error.content.message
          : error.message,
      ];
    }
  });

  const onSubmit = (data: QuestionSchemaType) => {
    if (
      data.content !== props.content &&
      (data.answer.content !== props.answer.content ||
        data.answer.choices !== props.answer.choices)
    ) {
      const uuid = crypto.randomUUID();
      data.id = uuid;
    }
    props.onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md flex flex-col gap-5 p-5 rounded-2xl border-2 border-blue"
    >
      <select {...register("type")}>
        <option value="short-answer">Short Answer</option>
        <option value="long-answer">Long Answer</option>
        <option value="multiple-choice">Multiple Choice</option>
      </select>
      <Textarea
        defaultValue={watch("content")}
        {...register("content")}
        onChange={(e) => {
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight + 2}px`;
        }}
      />

      <button
        className="flex flex-row items-center gap-1"
        onClick={(e) => {
          e.preventDefault();
          props.onQuestionGenerationRequest(watch("type"));
        }}
      >
        <TbReload />
        Generate with AI
      </button>
      {watch("type") === "multiple-choice" && (
        <ul className="space-y-2">
          {choices.map((choice, index) => {
            return (
              <div className="flex flex-grow gap-2" key={choice}>
                <Input
                  type="checkbox"
                  checked={watch("answer.choices")?.includes(choice)}
                  onChange={() => {
                    if (watch("answer.choices")?.includes(choice)) {
                      setValue(
                        "answer.choices",
                        watch("answer.choices")?.filter(
                          (answerChoice) => answerChoice !== choice
                        )
                      );
                    } else {
                      setValue(
                        "answer.choices",
                        watch("answer.choices")?.concat(choice)
                      );
                    }
                  }}
                  className="w-5 h-5"
                />
                <Textarea
                  autoFocus={choice === ""}
                  defaultValue={choice}
                  placeholder="Write a choice"
                  onChange={(e) => {
                    setValue(
                      "choices",
                      choices.map((c, i) => (i === index ? e.target.value : c))
                    );
                    const updatedAnswerChoices = watch("answer.choices")?.map(
                      (answerChoice) =>
                        answerChoice === choice ? e.target.value : answerChoice
                    );
                    setValue("answer.choices", updatedAnswerChoices);
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight + 2}px`;
                  }}
                  onBlur={(e) => {
                    setChoices(
                      choices.map((c, i) => (i === index ? e.target.value : c))
                    );
                  }}
                />
                <Button
                  size={"icon"}
                  variant={"outline"}
                  className="aspect-square"
                  onClick={(e) => {
                    e.preventDefault();

                    setValue(
                      "answer.choices",
                      watch("answer.choices")?.filter(
                        (answerChoice) => answerChoice !== choice
                      )
                    );
                    setValue(
                      "choices",
                      choices.filter((answerChoice) => answerChoice !== choice)
                    );
                    setChoices(
                      choices.filter((answerChoice) => answerChoice !== choice)
                    );
                  }}
                >
                  <MdDeleteOutline className="w-6 h-6" />
                </Button>
              </div>
            );
          })}
          <Button
            disabled={watch("choices")?.includes("")}
            onClick={(e) => {
              e.preventDefault();
              setValue("choices", [...choices, ""]);
              setChoices([...choices, ""]);
              // setValue("choices", [...(watch("choices") as string[]), ""]);
            }}
          >
            Add Choice
          </Button>
        </ul>
      )}
      <div className="flex items-center gap-1">
        <span>
          <Input
            type="number"
            {...register("marks", { valueAsNumber: true })}
            className="w-20"
          />
        </span>
        <p>{watch("marks") === 1 ? " mark" : " marks"}</p>
      </div>
      {(watch("type") === "short-answer" ||
        watch("type") === "long-answer") && (
        <div className="p-3 space-y-2 bg-lime-100/80 rounded-2xl border border-black/30">
          <p>Answer</p>
          <Textarea
            defaultValue={watch("answer.content")}
            {...register("answer.content")}
            onChange={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight + 2}px`;
            }}
          />

          {watch("content") &&
            (watch("type") === "short-answer" ||
              watch("type") === "long-answer") && (
              <button
                className="flex flex-row items-center gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  if (watch("content")) {
                    props.onAnswerGenerationRequest(
                      watch("answer.content"),
                      watch("content"),
                      watch("type") as "short-answer" | "long-answer"
                    );
                  }
                }}
              >
                <TbReload />
                Generate with AI
              </button>
            )}
        </div>
      )}
      {errorMessages.length > 0 && (
        <div className="p-3 bg-red-100/80 rounded-2xl">
          {errorMessages.map((error) => (
            <p className="text-red-500 ">{error}</p>
          ))}
        </div>
      )}

      <Button type="submit">
        {props.content === "" ? "Add Question" : "Update Question"}
      </Button>
    </form>
  );
}
