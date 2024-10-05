"use client";
import { FaCheckSquare } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { MdCheckBoxOutlineBlank, MdMoreVert } from "react-icons/md";
import { TbReload } from "react-icons/tb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import QuestionForm from "../forms/questionForm";
import { QuestionListType } from "./questionsPanel";

export type QuestionType = QuestionListType[0];
export type PropsType = {
  position: number;
  id: string;
  type: "short-answer" | "long-answer" | "multiple-choice";
  content: string;
  choices?: string[];
  marks: number;
  answer: {
    content?: string;
    choices?: string[];
  };
  onEdit: (data: QuestionType) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};
export default function Question(props: PropsType) {
  const [isEditing, setIsEditing] = useState(false);

  return isEditing ? (
    <QuestionForm
      {...props}
      onSubmit={(data) => {
        props.onEdit(data);
        setIsEditing(false);
      }}
    />
  ) : (
    <div
      className="relative max-w-md flex flex-col gap-5 p-5 rounded-2xl border border-black"
      onBlur={() => setIsEditing(false)}
    >
      <p>Question {props.position}</p>

      <DropdownMenu>
        <DropdownMenuTrigger className="absolute right-5 space-x-2">
          <MdMoreVert className="w-6 h-6 rounded-full" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => props.onMoveUp()}>
            Move up
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => props.onMoveDown()}>
            Move down
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => props.onDelete()}>
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div>
        <p className="text-lg font-medium">{props.content}</p>
        {props.choices && (
          <ul className="p-3 space-y-2">
            {props.choices?.map((choice) => {
              return (
                <li
                  key={choice}
                  className={
                    props.answer.choices?.includes(choice)
                      ? "text-green-500 font-bold flex flex-row gap-1"
                      : " flex flex-row gap-1"
                  }
                >
                  {props.answer.choices?.includes(choice) ? (
                    <FaCheckSquare className="w-5 h-5 mt-1" />
                  ) : (
                    <MdCheckBoxOutlineBlank className="w-5 h-5 mt-1" />
                  )}
                  <span className="w-[80%]">{choice}</span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-sm text-black/70">{props.marks} marks</p>
      </div>
      <div className="flex flex-wrap gap-5">
        <button className="flex flex-row items-center gap-1">
          <TbReload />
          Regenerate
        </button>
        <button
          className="flex flex-row items-center gap-1"
          onClick={() => setIsEditing(true)}
        >
          <FiEdit />
          Edit
        </button>
      </div>
      {props.answer.content && (
        <div className="p-3 space-y-2 bg-lime-100/80 rounded-2xl border border-black/30">
          <p>Answer</p>
          <p className="text-sm text-black/70">{props.answer.content}</p>
          <div className="flex flex-wrap gap-5">
            <button className="flex flex-row items-center gap-1">
              <TbReload />
              Regenerate
            </button>
            <button
              className="flex flex-row items-center gap-1"
              onClick={() => setIsEditing(true)}
            >
              <FiEdit />
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
