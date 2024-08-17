"use client";
import { useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import QuestionForm from "./questionForm";
import { QuestionType } from "./question";

export default function AddQuestionButton(props: {
  onAdd: (data: QuestionType) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);

  return isAdding ? (
    <QuestionForm
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
