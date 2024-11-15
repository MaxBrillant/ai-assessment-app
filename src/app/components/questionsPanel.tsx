"use client";

import { useEffect, useState } from "react";
import Question from "./question";
import AddQuestionButton from "./addQuestionButton";
import Sortable from "./sortable"; // React
import { motion } from "framer-motion";

export type QuestionListType = {
  id: string;
  type: "short-answer" | "long-answer" | "multiple-choice";
  content: string;
  choices?: string[];
  marks: number;
  answer: {
    content?: string;
    choices?: string[];
  };
}[];
export default function QuestionPanel(props: {
  defaultQuestions: QuestionListType;
  documentId: string;
  numberOfChunks: number;
  difficultyLevel: number;
  requirements: string | undefined;
  onChange: (data: QuestionListType) => void;
}) {
  const [questions, setQuestions] = useState<QuestionListType>(
    props.defaultQuestions
  );
  const [draggedId, setDraggedId] = useState<string | undefined>();

  useEffect(() => {
    if (questions !== props.defaultQuestions) {
      props.onChange(questions);
    }
  }, [questions]);

  return (
    <motion.div layout>
      <Sortable
        items={questions}
        setItems={(items) => {
          const scrollBarHeight = window.scrollY;
          setQuestions(items);
          window.scrollTo(0, scrollBarHeight);
        }}
        setDraggedId={setDraggedId}
        hasDelay={true}
      >
        <div className="relative w-full flex flex-col p-5 items-center bg-white">
          {!draggedId && (
            <div className="w-full max-w-md">
              <AddQuestionButton
                onAdd={(data) => {
                  questions.splice(0, 0, data);
                  setQuestions([...questions]);
                }}
                documentId={props.documentId}
                numberOfChunks={props.numberOfChunks}
                difficultyLevel={props.difficultyLevel}
                requirements={props.requirements}
              />
            </div>
          )}
          {questions.map((question, index) => {
            return (
              <div className={"w-full max-w-md flex flex-col"} key={index}>
                <Question
                  position={index + 1}
                  id={question.id}
                  type={
                    question.type as
                      | "short-answer"
                      | "long-answer"
                      | "multiple-choice"
                  }
                  content={question.content}
                  choices={question.choices}
                  marks={question.marks}
                  answer={{
                    content: question.answer.content,
                    choices: question.answer.choices,
                  }}
                  documentId={props.documentId}
                  numberOfChunks={props.numberOfChunks}
                  difficultyLevel={props.difficultyLevel}
                  requirements={props.requirements}
                  onEdit={(data) => {
                    questions[index] = data;
                    setQuestions([...questions]);
                  }}
                  onDelete={() => {
                    questions.splice(index, 1);
                    setQuestions([...questions]);
                  }}
                  onMoveUp={() => {
                    if (index > 0) {
                      const temp = questions[index - 1];
                      questions[index - 1] = questions[index];
                      questions[index] = temp;
                      setQuestions([...questions]);
                    }
                  }}
                  onMoveDown={() => {
                    if (index < questions.length - 1) {
                      const temp = questions[index + 1];
                      questions[index + 1] = questions[index];
                      questions[index] = temp;
                      setQuestions([...questions]);
                    }
                  }}
                  isDragging={draggedId === question.id.toString()}
                />
                {!draggedId && (
                  <AddQuestionButton
                    onAdd={(data) => {
                      questions.splice(index + 1, 0, data);
                      setQuestions([...questions]);
                    }}
                    documentId={props.documentId}
                    numberOfChunks={props.numberOfChunks}
                    difficultyLevel={props.difficultyLevel}
                    requirements={props.requirements}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Sortable>
    </motion.div>
  );
}
