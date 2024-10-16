"use client";

import { useEffect, useState } from "react";
import Question from "./question";
import AddQuestionButton from "./addQuestionButton";
import { generateQuestion } from "../api/generate/question/generateQuestion";
import { generateAnswer } from "../api/generate/answer/generateAnswer";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    props.onChange(questions);
  }, [questions]);

  return (
    <div className="p-5 w-fit mx-auto">
      {questions.map((question, index) => {
        return (
          <div>
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
              onQuestionGenerationRequest={async (
                currentlySelectedType:
                  | "short-answer"
                  | "multiple-choice"
                  | "long-answer"
              ) => {
                const generatedQuestion = await generateQuestion(
                  question.content ? question.content : "No question",
                  currentlySelectedType,
                  props.context,
                  props.difficultyLevel,
                  props.requirements
                );
                if (generatedQuestion) {
                  props.defaultQuestions[index] = generatedQuestion;
                  setQuestions([...props.defaultQuestions]);
                } else {
                  toast({
                    description:
                      "Something went wrong while generating the question",
                    title: "Error",
                    variant: "destructive",
                  });
                }
              }}
              onAnswerGenerationRequest={async (
                currentAnswer,
                currentQuestion,
                currentlySelectedType
              ) => {
                const generatedAnswer = await generateAnswer(
                  currentAnswer ? currentAnswer : "No answer",
                  currentlySelectedType,
                  currentQuestion,
                  props.context
                );
                if (generatedAnswer) {
                  props.defaultQuestions[index].answer.content =
                    generatedAnswer.answer;

                  props.defaultQuestions[index].choices = undefined;

                  props.defaultQuestions[index].answer.choices = undefined;

                  props.defaultQuestions[index].type = currentlySelectedType;

                  props.defaultQuestions[index].content = currentQuestion;
                  props.defaultQuestions[index].marks = generatedAnswer.marks;
                  setQuestions([...props.defaultQuestions]);
                } else {
                  toast({
                    description:
                      "Something went wrong while generating the answer",
                    title: "Error",
                    variant: "destructive",
                  });
                }
              }}
            />
            <AddQuestionButton
              onAdd={(data) => {
                props.defaultQuestions.splice(index + 1, 0, data);
                setQuestions([...props.defaultQuestions]);
              }}
              onQuestionGenerationRequest={async (
                currentlySelectedType:
                  | "short-answer"
                  | "multiple-choice"
                  | "long-answer"
              ) => {
                const generatedQuestion = await generateQuestion(
                  question.content ? question.content : "No question",
                  currentlySelectedType,
                  props.context,
                  props.difficultyLevel,
                  props.requirements
                );
                if (generatedQuestion) {
                  props.defaultQuestions[index] = generatedQuestion;
                  setQuestions([...props.defaultQuestions]);
                } else {
                  toast({
                    description:
                      "Something went wrong while generating the question",
                    title: "Error",
                    variant: "destructive",
                  });
                }
              }}
              onAnswerGenerationRequest={async (
                currentAnswer,
                currentQuestion,
                currentlySelectedType
              ) => {
                const generatedAnswer = await generateAnswer(
                  currentAnswer ? currentAnswer : "No answer",
                  currentlySelectedType,
                  currentQuestion,
                  props.context
                );
                if (generatedAnswer) {
                  props.defaultQuestions[index].answer.content =
                    generatedAnswer.answer;

                  props.defaultQuestions[index].choices = undefined;

                  props.defaultQuestions[index].answer.choices = undefined;

                  props.defaultQuestions[index].type = currentlySelectedType;

                  props.defaultQuestions[index].content = currentQuestion;
                  props.defaultQuestions[index].marks = generatedAnswer.marks;
                  setQuestions([...props.defaultQuestions]);
                } else {
                  toast({
                    description:
                      "Something went wrong while generating the answer",
                    title: "Error",
                    variant: "destructive",
                  });
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
