"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
import { createAssessment } from "../api/assessments/mutations";
import { useToast } from "@/hooks/use-toast";

export type GeneratedTestType = {
  title: string;
  totalMarks: number;
  questions: Array<{
    id: string;
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
  const urlParams = useSearchParams();
  const { toast } = useToast();

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

        try {
          const data = await fetch("/api/generate/assessment", {
            method: "POST",
            body: formData,
          });
          const assessmentJson = await data.json();
          const assessmentObject: GeneratedTestType = JSON.parse(
            assessmentJson.assessment
          );
          setGeneratedAssessment(assessmentObject);
          assessmentContext.context = assessmentJson.context;
        } catch (err) {
          toast({
            description: "Something went wrong while generating the assessment",
            title: "Error",
            variant: "destructive",
          });
        }
      };

      const createNewAssessment = async () => {
        const formData = new FormData();
        formData.append("title", assessmentContext.title);
        formData.append("context", assessmentContext.context);
        formData.append(
          "questions",
          JSON.stringify(assessmentContext.questions)
        );
        formData.append(
          "requirements",
          assessmentContext.requirements ? assessmentContext.requirements : ""
        );
        formData.append(
          "difficultyLevel",
          String(assessmentContext.difficultyLevel)
        );
        formData.append("duration", assessmentContext.duration);
        formData.append(
          "instructions",
          assessmentContext.instructions ? assessmentContext.instructions : ""
        );
        formData.append(
          "credentials",
          JSON.stringify(assessmentContext.credentials)
        );
        const newAssessmentNanoId = await createAssessment(formData);

        if (newAssessmentNanoId) {
          toast({
            title: "Assessment created successfully",
          });
        } else {
          toast({
            description: "Something went wrong while creating the assessment",
            title: "Error",
            variant: "destructive",
          });
        }
      };
      if (urlParams.get("create") && urlParams.get("create") === "true") {
        createNewAssessment();
      } else {
        fetchQuestions();
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <AssessmentProvider>
      <div>
        {urlParams.get("create") && urlParams.get("create") === "true" ? (
          <p>Creating your assessment</p>
        ) : generatedAssessment ? (
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
                    defaultValues={{
                      title: generatedAssessment.title,
                      instructions: undefined,
                      duration: "60",
                      credentials: ["Full name", "Student ID"],
                    }}
                    mode="create"
                    onSubmit={(data) => {
                      assessmentContext.title = data.title;
                      assessmentContext.duration = data.duration;
                      assessmentContext.instructions = data.instructions;
                      assessmentContext.credentials = data.credentials;

                      push(
                        "/login?redirect=" +
                          location.origin +
                          "/edit?create=true"
                      );
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <QuestionPanel
              defaultQuestions={generatedAssessment.questions}
              context={assessmentContext.context}
              difficultyLevel={assessmentContext.difficultyLevel}
              requirements={assessmentContext.requirements}
              onChange={(questions) => {
                assessmentContext.questions = questions;
              }}
            />
          </div>
        ) : (
          <div>
            <p>Your assessment is being generated...</p>
          </div>
        )}
      </div>
    </AssessmentProvider>
  );
}
