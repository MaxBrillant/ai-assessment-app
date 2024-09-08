import { createContext, useState } from "react";
import { questionSchema } from "../validation/questionValidation";
import { z } from "zod";

type AssessmentContextType = {
  document: File | undefined;
  numberOfQuestions: number;
  totalMarks: number;
  startingFrom: number | undefined;
  endingAt: number | undefined;
  requirements: string | undefined;
  title: string;
  questions: z.infer<typeof questionSchema>[];
  context: string;
  duration: string;
  instructions: string | undefined;
  credentials: string[];
  difficultyLevel: number;
};
const AssessmentContext = createContext<AssessmentContextType>({
  document: undefined,
  numberOfQuestions: 0,
  totalMarks: 0,
  startingFrom: undefined,
  endingAt: undefined,
  requirements: undefined,
  title: "",
  questions: [],
  context: "",
  duration: "",
  instructions: undefined,
  credentials: [],
  difficultyLevel: 0,
});

const AssessmentProvider = ({ children }: any) => {
  const [assessment, setAssessment] = useState<AssessmentContextType>({
    document: undefined,
    numberOfQuestions: 0,
    totalMarks: 0,
    startingFrom: undefined,
    endingAt: undefined,
    requirements: undefined,
    title: "",
    questions: [],
    context: "",
    duration: "",
    instructions: undefined,
    credentials: [],
    difficultyLevel: 0,
  });
  return (
    <AssessmentContext.Provider value={assessment}>
      {children}
    </AssessmentContext.Provider>
  );
};

export { AssessmentContext, AssessmentProvider };
