"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { questionSchema } from "../validation/questionValidation";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HiOutlineSparkles } from "react-icons/hi2";
import { QuestionType } from "../components/question";
import GeneratePopover from "./generatePopover";
import { useToast } from "@/hooks/use-toast";
import { generateAnswer } from "../api/generate/answer/generateAnswer";
import TextEditor from "../components/textEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiPlus } from "react-icons/fi";
import { Draggable } from "../components/draggable";
import Sortable from "../components/sortable";
import pickRandomChunks from "../api/generate/assessment/pickRandomChunks";
import { generateSingleQuestion } from "../api/generate/question/generateSingleQuestion";

type QuestionSchemaType = z.infer<typeof questionSchema>;
type QuestionFormType = QuestionType & {
  documentId: string;
  numberOfChunks: number;
  difficultyLevel: number;
  requirements: string | undefined;
  onSubmit: (data: QuestionSchemaType) => void;
  onCancel: () => void;
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
  const formRef = useRef<HTMLFormElement | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();

  const [draggedId, setDraggedId] = useState<string | undefined>();

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (watch("type") === "short-answer" || watch("type") === "long-answer") {
      setValue("choices", undefined);
      setValue("answer.choices", undefined);
    } else {
      setValue("answer.content", undefined);
      setValue("choices", choices);
      setValue(
        "answer.choices",
        watch("answer.choices") ? watch("answer.choices") : props.answer.choices
      );
    }
  }, [watch("type")]);

  function autoResize(textArea: HTMLTextAreaElement) {
    // Remove the height constraint
    textArea.style.removeProperty("height");
    // Set height to 0
    textArea.style.height = "0px";
    // Set height to match the content
    textArea.style.height = textArea.scrollHeight + "px";
  }

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
      ref={formRef as any}
      onSubmit={handleSubmit(onSubmit)}
      className={
        (isGenerating
          ? "animate-pulse duration-1000 pointer-events-none transition-all ease-in-out "
          : "") +
        "relative w-full flex flex-col bg-white rounded-xl border border-black/30 overflow-clip"
      }
    >
      <div className="flex flex-col p-5 gap-3">
        <div className="w-full flex flex-row gap-3 items-center justify-between">
          <div className="flex-grow">
            <Select
              onValueChange={(value) =>
                setValue(
                  "type",
                  value as "short-answer" | "long-answer" | "multiple-choice"
                )
              }
              value={watch("type")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short-answer">Short Answer</SelectItem>
                <SelectItem value="long-answer">Long Answer</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <GeneratePopover
            onSubmit={async (newRequirement) => {
              setIsGenerating(true);
              try {
                const generatedQuestion = await generateSingleQuestion({
                  documentId: props.documentId,
                  type: watch("type"),
                  marks: watch("marks"),
                  difficultyLevel: props.difficultyLevel,
                  numberOfChunks: props.numberOfChunks,
                  requirements: newRequirement ? newRequirement : "",
                  previousQuestion: watch("content"),
                });
                if (generatedQuestion) {
                  setValue("type", generatedQuestion.type);
                  setValue("content", generatedQuestion.content);
                  setValue("marks", generatedQuestion.marks);
                  if (generatedQuestion.type === "multiple-choice") {
                    setValue("choices", generatedQuestion.choices);
                    setValue(
                      "answer.choices",
                      generatedQuestion.answer.choices
                    );
                    setChoices(generatedQuestion.choices as string[]);
                    setValue("answer.content", undefined);
                  } else {
                    setValue(
                      "answer.content",
                      generatedQuestion.answer.content
                    );
                    setValue("choices", undefined);
                    setValue("answer.choices", undefined);
                    setChoices([]);
                  }
                }
              } catch (err) {
                toast({
                  description:
                    "Something went wrong while generating the question",
                  title: "Error",
                  variant: "destructive",
                });
              }
              setIsGenerating(false);
            }}
          >
            <button
              className="w-fit flex flex-row px-2 py-1 items-center text-center text-sm text-black/70 gap-1 bg-black/5 border border-black/10 rounded-full"
              onClick={() => {}}
            >
              <HiOutlineSparkles />
              Generate
            </button>
          </GeneratePopover>
        </div>

        <div className="w-full">
          <TextEditor
            value={watch("content")}
            onChange={(value) => {
              setValue("content", value as string);
            }}
            hasFocus={watch("content") === ""}
            isTextArea={false}
            placeholder="Write the question here"
          />
        </div>

        <span className="flex flex-row gap-2 items-center">
          <Input
            type="number"
            {...register("marks", { valueAsNumber: true })}
            className="w-20"
          />
          <p className="text-sm font-light">
            {watch("marks") === 1 ? " mark" : " marks"}
          </p>
        </span>
      </div>

      <div className="relative p-3 border-t border-black/30">
        {watch("type") === "multiple-choice" && (
          <ul className="space-y-2 p-3">
            {choices.length > 1 && (
              <p className="w-full text-center text-xs text-black/50 -mt-4">
                Press and hold to reorder
              </p>
            )}
            <Sortable
              items={
                watch("choices")?.map((choice) => {
                  return { id: choice, choice: choice };
                }) as any[]
              }
              setItems={(items) => {
                setValue(
                  "choices",
                  items.map((item) => item.choice)
                );
                setChoices(items.map((item) => item.choice));
              }}
              setDraggedId={setDraggedId}
              hasDelay={true}
            >
              {choices.map((choice, index) => {
                return (
                  <Draggable id={choice} key={choice}>
                    <div
                      className={
                        (draggedId === choice
                          ? "z-30 opacity-50 drop-shadow-md"
                          : "z-0") +
                        " relative flex flex-grow gap-2 items-start"
                      }
                      key={choice}
                    >
                      <Input
                        type="checkbox"
                        className="w-5 h-5 mt-1"
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
                      />
                      <textarea
                        autoFocus={choice === ""}
                        defaultValue={choice}
                        placeholder="Write a choice"
                        className="w-full p-1 text-sm font-light border-b focus:border focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                        rows={1}
                        onFocus={(e) => autoResize(e.currentTarget)}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            index === choices.length - 1
                          ) {
                            e.preventDefault();
                            e.currentTarget.blur();
                            setTimeout(() => {
                              document.getElementById("add-choice")?.click();
                            }, 30);
                          }
                        }}
                        onChange={(e) => {
                          setValue(
                            "choices",
                            choices.map((c, i) =>
                              i === index ? e.target.value : c
                            )
                          );
                          autoResize(e.target);
                        }}
                        onBlur={(e) => {
                          // If the previous value has already been selected, select the new value, and don't allow it to be selected again

                          if (
                            watch("answer.choices")?.includes(choices[index])
                          ) {
                            const selectedChoice = watch(
                              "answer.choices"
                            )?.find((choice) => choices[index] === choice);

                            setValue(
                              "answer.choices",
                              watch("answer.choices")
                                ?.filter(
                                  (answerChoice) =>
                                    answerChoice !== selectedChoice
                                )
                                .concat(e.target.value)
                            );
                          }

                          setChoices(
                            choices.map((c, i) =>
                              i === index ? e.target.value : c
                            )
                          );
                          autoResize(e.target);
                        }}
                      />
                    </div>
                  </Draggable>
                );
              })}
            </Sortable>
            <button
              id="add-choice"
              className="w-fit flex flex-row px-2 py-1 items-center text-center text-sm gap-1 rounded-full opacity-70 hover:opacity-100 focus:opacity-100 hover:bg-black/5 focus:bg-black/5"
              disabled={watch("choices")?.includes("")}
              onClick={(e) => {
                e.preventDefault();
                setValue("choices", [...choices, ""]);
                setChoices([...choices, ""]);
                // setValue("choices", [...(watch("choices") as string[]), ""]);
              }}
            >
              <span>
                <FiPlus className="w-5 h-5" />
              </span>
              Add a choice
            </button>
          </ul>
        )}

        {(watch("type") === "short-answer" ||
          watch("type") === "long-answer") && (
          <div className="flex flex-row justify-end">
            <GeneratePopover
              onSubmit={async (newRequirement) => {
                try {
                  setIsGenerating(true);
                  if (watch("content")) {
                    const generatedAnswer = await generateAnswer({
                      documentId: props.documentId,
                      type: watch("type") as "short-answer" | "long-answer",
                      question: watch("content"),
                      difficultyLevel: props.difficultyLevel,
                      requirements: newRequirement,
                    });

                    if (generatedAnswer) {
                      setValue("answer.content", generatedAnswer.answer);
                      setValue("choices", undefined);
                      setValue("answer.choices", undefined);
                      setChoices([]);
                      setValue("marks", generatedAnswer.marks);
                    } else {
                      toast({
                        description:
                          "Something went wrong while generating the answer",
                        title: "Error",
                        variant: "destructive",
                      });
                    }
                    setIsGenerating(false);
                  }
                } catch (e) {
                  toast({
                    description:
                      "Something went wrong while generating the answer",
                    title: "Error",
                    variant: "destructive",
                  });
                  setIsGenerating(false);
                }
              }}
            >
              <button
                className="w-fit flex flex-row px-2 py-1 items-center text-center text-sm text-black/70 gap-1 bg-black/5 border border-black/10 rounded-full"
                onClick={() => {}}
              >
                <HiOutlineSparkles />
                Generate
              </button>
            </GeneratePopover>
          </div>
        )}

        {(watch("type") === "short-answer" ||
          watch("type") === "long-answer") && (
          <TextEditor
            value={watch("answer.content")}
            onChange={(value) => {
              setValue("answer.content", value);
            }}
            isTextArea={true}
            placeholder="Write the answer to the question here"
          />
        )}
      </div>

      {errorMessages.length > 0 && (
        <div className="p-3 bg-red-100/80 rounded-2xl">
          {errorMessages.map((error) => (
            <p className="text-red-500 " key={error}>
              {error}
            </p>
          ))}
        </div>
      )}

      <div className="w-full grid grid-cols-2 gap-2 p-3">
        <Button
          variant={"secondary"}
          onClick={(e) => {
            e.preventDefault();
            props.onCancel();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {props.content === "" ? "Add Question" : "Update Question"}
        </Button>
      </div>
    </form>
  );
}
