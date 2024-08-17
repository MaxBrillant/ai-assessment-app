"use client";

import { useState } from "react";
import Question from "./question";
import { IoIosAddCircleOutline } from "react-icons/io";
import AddQuestionButton from "./addQuestionButton";

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
  generatedQuestions: QuestionListType;
}) {
  const [questions, setQuestions] = useState<QuestionListType>(
    props.generatedQuestions
  );
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
                props.generatedQuestions[index] = data;
                setQuestions([...props.generatedQuestions]);
              }}
              onDelete={() => {
                props.generatedQuestions.splice(index, 1);
                setQuestions([...props.generatedQuestions]);
              }}
              onMoveUp={() => {
                if (index > 0) {
                  const temp = props.generatedQuestions[index - 1];
                  props.generatedQuestions[index - 1] =
                    props.generatedQuestions[index];
                  props.generatedQuestions[index] = temp;
                  setQuestions([...props.generatedQuestions]);
                }
              }}
              onMoveDown={() => {
                if (index < props.generatedQuestions.length - 1) {
                  const temp = props.generatedQuestions[index + 1];
                  props.generatedQuestions[index + 1] =
                    props.generatedQuestions[index];
                  props.generatedQuestions[index] = temp;
                  setQuestions([...props.generatedQuestions]);
                }
              }}
            />
            <AddQuestionButton
              onAdd={(data) => {
                props.generatedQuestions.splice(index + 1, 0, data);
                setQuestions([...props.generatedQuestions]);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
