"use client";
import { useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { QuestionType } from "./question";
import QuestionForm from "../forms/questionForm";
import { randomUUID } from "crypto";

export default function AddQuestionButton(props: {
  onAdd: (data: QuestionType) => void;
  onQuestionGenerationRequest: (
    currentlySelectedType: "short-answer" | "multiple-choice" | "long-answer"
  ) => void;
  onAnswerGenerationRequest: (
    currentAnswer: string | undefined,
    currentQuestion: string,
    currentlySelectedType: "short-answer" | "long-answer"
  ) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);

  return isAdding ? (
    <QuestionForm
      id={crypto.randomUUID()}
      type={"short-answer"}
      content={""}
      marks={5}
      answer={{
        content: "",
      }}
      onSubmit={(data) => {
        props.onAdd(data);
        setIsAdding(false);
      }}
      onQuestionGenerationRequest={(currentlySelectedType) => {
        props.onQuestionGenerationRequest(currentlySelectedType);
        setIsAdding(false);
      }}
      onAnswerGenerationRequest={(currentAnswer, currentQuestion, currentlySelectedType) => {
        props.onAnswerGenerationRequest(currentAnswer, currentQuestion, currentlySelectedType);
        setIsAdding(false);
      }}
    />
  ) : (
    <button
      className="flex items-center gap-1 mx-auto p-1 px-2 opacity-70 hover:opacity-100 focus:opacity-100 hover:bg-slate-200 focus:bg-slate-200 rounded-full"
      onClick={() => {
        setIsAdding(true);
      }}
    >
      <span>
        <IoIosAddCircleOutline className="w-6 h-6" />
      </span>
      Add a question here
    </button>
  );
}
