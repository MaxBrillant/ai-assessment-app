"use client";

import { useEffect, useState } from "react";
import Question from "./question";
import AddQuestionButton from "./addQuestionButton";

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
  context: string;
  difficultyLevel: number;
  requirements: string | undefined;
  onChange: (data: QuestionListType) => void;
}) {
  const [questions, setQuestions] = useState<QuestionListType>(
    props.defaultQuestions
  );

  useEffect(() => {
    props.onChange(questions);
  }, [questions]);

  return (
    <div className="w-full flex flex-col p-5 items-center bg-black/5">
      {questions.map((question, index) => {
        return (
          <div className="w-full max-w-md flex flex-col">
            <Question
              key={index + 1}
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
              context={props.context}
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
            />
            <AddQuestionButton
              onAdd={(data) => {
                questions.splice(index + 1, 0, data);
                setQuestions([...questions]);
              }}
              context={props.context}
              difficultyLevel={props.difficultyLevel}
              requirements={props.requirements}
            />
          </div>
        );
      })}
    </div>
  );
}
