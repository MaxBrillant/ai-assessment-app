import { createContext, useState } from "react";
import { questionSchema } from "../validation/questionValidation";
import { z } from "zod";
import { QuestionType } from "../components/question";

type AssessmentContextType = {
  document: File | undefined;
  numberOfQuestions: number;
  totalMarks: number;
  numberOfChunks: number;
  requirements: string | undefined;
  title: string;
  questions: QuestionType[];
  duration: string;
  instructions: string | undefined;
  credentials: string[];
  difficultyLevel: number;
};
const AssessmentContext = createContext<AssessmentContextType>({
  document: undefined,
  numberOfQuestions: 0,
  totalMarks: 0,
  numberOfChunks: 0,
  requirements: undefined,
  title: "",
  questions: [],
  duration: "60",
  instructions: undefined,
  credentials: ["Email address", "Full name"],
  difficultyLevel: 0,
});

const AssessmentProvider = ({ children }: any) => {
  const [assessment, setAssessment] = useState<AssessmentContextType>({
    document: undefined,
    numberOfQuestions: 0,
    totalMarks: 0,
    numberOfChunks: 0,
    requirements: undefined,
    title: "",
    questions: [],
    duration: "60",
    instructions: undefined,
    credentials: ["Email address", "Full name"],
    difficultyLevel: 0,
  });
  return (
    <AssessmentContext.Provider value={assessment}>
      {children}
    </AssessmentContext.Provider>
  );
};

export { AssessmentContext, AssessmentProvider };
