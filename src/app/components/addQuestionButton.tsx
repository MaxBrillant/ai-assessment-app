"use client";
import { useState } from "react";
import { QuestionType } from "./question";
import QuestionForm from "../forms/questionForm";
import { FiPlus } from "react-icons/fi";

export default function AddQuestionButton(props: {
  onAdd: (data: QuestionType) => void;
  documentId: string;
  numberOfChunks: number;
  difficultyLevel: number;
  requirements: string | undefined;
}) {
  const [isAdding, setIsAdding] = useState(false);

  return isAdding ? (
    <div className="w-full flex flex-col">
      <div className="fixed top-0 bottom-0 left-0 right-0 pointer-events-none z-20 bg-black/50"></div>
      <div className="z-30">
        <QuestionForm
          id={crypto.randomUUID()}
          type={"short-answer"}
          content={""}
          marks={5}
          answer={{
            content: "",
          }}
          documentId={props.documentId}
          numberOfChunks={props.numberOfChunks}
          difficultyLevel={props.difficultyLevel}
          requirements={props.requirements}
          onSubmit={(data) => {
            props.onAdd(data);
            setIsAdding(false);
          }}
          onCancel={() => {
            setIsAdding(false);
          }}
        />
      </div>
    </div>
  ) : (
    <button
      className="w-fit mx-auto flex flex-row px-2 py-1 items-center text-center text-sm gap-1 rounded-full opacity-70 hover:opacity-100 focus:opacity-100 hover:bg-black/5 focus:bg-black/5"
      onClick={() => {
        setIsAdding(true);
      }}
    >
      <span>
        <FiPlus className="w-5 h-5" />
      </span>
      Add a question here
    </button>
  );
}
