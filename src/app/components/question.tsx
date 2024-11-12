"use client";
import { FiEdit3 } from "react-icons/fi";
import { MdMoreVert } from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi2";
import { RxDotFilled } from "react-icons/rx";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useRef, useState } from "react";
import QuestionForm from "../forms/questionForm";
import { QuestionListType } from "./questionsPanel";
import { FaCheck } from "react-icons/fa6";

import { useSortable } from "@dnd-kit/sortable";
import SafeHTMLRenderer from "@/utils/htmlRenderer";
import GeneratePopover from "../forms/generatePopover";
import { generateSingleQuestion } from "../api/generate/question/generateSingleQuestion";
import { useToast } from "@/hooks/use-toast";

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
  documentId: string;
  numberOfChunks: number;
  difficultyLevel: number;
  requirements: string | undefined;
  onEdit: (data: QuestionType) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isDragging: boolean;
};
export default function Question(props: PropsType) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>();
  const { toast } = useToast();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
      }
    : undefined;

  useEffect(() => {
    // Check if content height is greater than 120px
    if (containerRef.current) {
      const contentHeight = containerRef.current.scrollHeight;
      setShowButton(contentHeight >= 120);
      // If content is smaller than or equal to 120px, keep it expanded
      setIsExpanded(contentHeight <= 120);
    }
  }, [props.answer]);

  return isEditing ? (
    <div className="w-full flex flex-col">
      <div className="fixed inset-0 z-20 bg-black/50"></div>
      <div className="z-30" onClick={(e) => e.stopPropagation()}>
        <QuestionForm
          {...props}
          onSubmit={(data) => {
            props.onEdit(data);
            setIsEditing(false);
          }}
          onCancel={() => {
            setIsEditing(false);
          }}
        />
      </div>
    </div>
  ) : (
    <div
      className={
        (props.isDragging ? "z-20 drop-shadow-2xl " : "") +
        (isGenerating
          ? "animate-pulse duration-1000 pointer-events-none transition-all ease-in-out "
          : "") +
        "relative w-full flex flex-col bg-white rounded-xl border border-black/30 overflow-clip"
      }
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div className="flex flex-col p-5 gap-3">
        <p
          className={
            (props.isDragging ? "cursor-grabbing" : "cursor-grab") + " text-sm"
          }
          {...listeners}
        >
          Question {props.position}
          {" • "}
          <span className="text-xs text-black/70">
            {props.type === "multiple-choice"
              ? "Multiple Choice"
              : props.type === "long-answer"
              ? "Long Answer"
              : "Short Answer"}
          </span>
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger className="absolute right-5 top-3 space-x-2">
            <MdMoreVert className="w-7 h-7 p-1 rounded-full" />
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

        <p className="font-medium">
          <SafeHTMLRenderer htmlContent={props.content} />
        </p>
        <p className="text-sm font-light">{props.marks} marks</p>
        <div className="flex flex-wrap gap-2">
          <button
            className="w-fit flex flex-row px-2 py-1 items-center text-center text-sm text-black/70 gap-1 bg-black/5 border border-black/10 rounded-full"
            onClick={() => setIsEditing(true)}
          >
            <FiEdit3 />
            Edit
          </button>
          <GeneratePopover
            onSubmit={async (newRequirement) => {
              setIsGenerating(true);
              try {
                const generatedQuestion = await generateSingleQuestion({
                  documentId: props.documentId,
                  type: props.type,
                  marks: props.marks,
                  difficultyLevel: props.difficultyLevel,
                  numberOfChunks: props.numberOfChunks,
                  requirements: newRequirement ? newRequirement : "",
                  previousQuestion: props.content,
                });
                if (generatedQuestion) {
                  props.onEdit(generatedQuestion);
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
              Improve
            </button>
          </GeneratePopover>
        </div>
      </div>
      <div
        ref={containerRef as any}
        className={
          `${isExpanded ? "h-auto" : "h-[120px]"}` +
          " relative p-3 border-t border-black/30 transition-all duration-300 ease-in-out"
        }
      >
        {props.answer.content && (
          <div className="space-y-2">
            <p className="text-sm font-light">
              <SafeHTMLRenderer htmlContent={props.answer.content} />
            </p>
          </div>
        )}

        {props.choices && (
          <ul className="space-y-2">
            {props.choices?.map((choice) => {
              return (
                <li
                  key={choice}
                  className={
                    props.answer.choices?.includes(choice)
                      ? "text-green-600 text-sm flex flex-row gap-1"
                      : "text-black/70 text-sm flex flex-row gap-1"
                  }
                >
                  {props.answer.choices?.includes(choice) ? (
                    <FaCheck className="w-5 h-5" />
                  ) : (
                    <RxDotFilled className="w-5 h-5 text-black/30" />
                  )}
                  <span className="w-[80%]">{choice}</span>
                </li>
              );
            })}
          </ul>
        )}

        {showButton && (
          <div
            className={
              isExpanded
                ? "flex flex-col items-center justify-end pt-2"
                : "absolute h-3/4 bottom-0 left-0 right-0 bg-gradient-to-b from-white/0 via-white/60 via-40% to-white/100 flex flex-col justify-end items-center pb-2"
            }
          >
            <button
              className="w-fit flex flex-row px-2 py-1 items-center text-center text-sm text-black/70 gap-1 bg-gray-100 border border-gray-400 rounded-full"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <IoChevronUp /> : <IoChevronDown />}
              {isExpanded
                ? "Show less"
                : props.type === "multiple-choice"
                ? "Show all choices"
                : "Show more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
