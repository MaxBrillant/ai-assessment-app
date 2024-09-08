"use client";

import { useContext, useEffect, useState } from "react";
import Question from "./question";
import AddQuestionButton from "./addQuestionButton";
import { AssessmentContext } from "../context/assessmentContext";

type QuestionListType = {
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
}) {
  const [questions, setQuestions] = useState<QuestionListType>(
    props.defaultQuestions
  );
  const assessmentContext = useContext(AssessmentContext);

  useEffect(() => {
    assessmentContext.questions = questions;
  }, [questions]);

  return (
    <div className="p-5 w-fit mx-auto">
      {questions.map((question, index) => {
        return (
          <div>
            <Question
              key={index + 1}
              position={index + 1}
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
              onEdit={(data) => {
                props.defaultQuestions[index] = data;
                setQuestions([...props.defaultQuestions]);
              }}
              onDelete={() => {
                props.defaultQuestions.splice(index, 1);
                setQuestions([...props.defaultQuestions]);
              }}
              onMoveUp={() => {
                if (index > 0) {
                  const temp = props.defaultQuestions[index - 1];
                  props.defaultQuestions[index - 1] =
                    props.defaultQuestions[index];
                  props.defaultQuestions[index] = temp;
                  setQuestions([...props.defaultQuestions]);
                }
              }}
              onMoveDown={() => {
                if (index < props.defaultQuestions.length - 1) {
                  const temp = props.defaultQuestions[index + 1];
                  props.defaultQuestions[index + 1] =
                    props.defaultQuestions[index];
                  props.defaultQuestions[index] = temp;
                  setQuestions([...props.defaultQuestions]);
                }
              }}
            />
            <AddQuestionButton
              onAdd={(data) => {
                props.defaultQuestions.splice(index + 1, 0, data);
                setQuestions([...props.defaultQuestions]);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
