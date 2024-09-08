"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import {
  AssessmentContext,
  AssessmentProvider,
} from "../context/assessmentContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import QuestionPanel from "../components/questionsPanel";
import RulesForm from "../forms/rulesForm";
import Link from "next/link";

export type GeneratedTestType = {
  title: string;
  totalMarks: number;
  questions: Array<{
    type: "short-answer" | "long-answer" | "multiple-choice";
    content: string;
    choices?: string[];
    marks: number;
    answer: {
      content?: string;
      choices?: string[];
    };
  }>;
};
export default function Edit() {
  const assessmentContext = useContext(AssessmentContext);
  const [generatedAssessment, setGeneratedAssessment] = useState<
    GeneratedTestType | undefined
  >();
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const { push } = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Your original hook code here
      if (
        !assessmentContext.document ||
        !assessmentContext.numberOfQuestions ||
        !assessmentContext.totalMarks ||
        !assessmentContext.difficultyLevel
      ) {
        push("/");
      }

      const fetchQuestions = async () => {
        const formData = new FormData();
        formData.append("file", assessmentContext.document as File);
        formData.append(
          "type",
          assessmentContext.document?.type === "application/pdf"
            ? "pdf"
            : assessmentContext.document?.type ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ? "docx"
            : "pptx"
        );
        formData.append(
          "questions",
          String(assessmentContext.numberOfQuestions)
        );
        formData.append("marks", String(assessmentContext.totalMarks));
        formData.append(
          "difficulty-level",
          String(assessmentContext.difficultyLevel)
        );
        formData.append(
          "requirements",
          assessmentContext.requirements as string
        );
        formData.append("startingFrom", String(assessmentContext.startingFrom));
        formData.append("endingAt", String(assessmentContext.endingAt));

        const data = await fetch("/api/generate/questions-and-answers", {
          method: "POST",
          body: formData,
        });
        const assessmentJson = await data.json();
        const assessmentObject: GeneratedTestType = JSON.parse(
          (assessmentJson.assessment)
        );
        setGeneratedAssessment(assessmentObject);
        assessmentContext.context = assessmentJson.context;
      };
      fetchQuestions();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <AssessmentProvider>
      {generatedAssessment ? (
        <div className="text-left">
          <Link href={"/"}>
            <Button variant="ghost">Go back to home</Button>
          </Link>
          <div className="flex flex-col gap-1 p-3">
            <p className="text-3xl font-semibold">
              {generatedAssessment.title}
            </p>
            <p>{generatedAssessment.totalMarks} marks</p>
            <p>{generatedAssessment?.questions.length} questions generated</p>
            <Dialog open={isRulesOpen} onOpenChange={setIsRulesOpen}>
              <DialogTrigger asChild>
                <Button className="w-fit">Finish</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[100vh] overflow-auto">
                <RulesForm
                  title={generatedAssessment.title}
                  onSubmit={(data) => {
                    assessmentContext.title = data.title;
                    assessmentContext.duration = data.duration;
                    assessmentContext.instructions = data.instructions;
                    assessmentContext.credentials = data.credentials;
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
          <QuestionPanel defaultQuestions={generatedAssessment.questions} />
        </div>
      ) : (
        <div>
          <p>Your assessment is being generated...</p>
        </div>
      )}
    </AssessmentProvider>
  );
}
