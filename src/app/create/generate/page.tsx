"use client";

import { createAssessment } from "@/app/api/assessments/mutations";
import { QuestionType } from "@/app/components/question";
import {
  AssessmentContext,
  AssessmentProvider,
} from "@/app/context/assessmentContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { RiLoader3Fill } from "react-icons/ri";

type GeneratedTestType = {
  title: string;
  questions: QuestionType[];
  documentId: string;
  numberOfChunks: number;
};
export default function Generate() {
  const { replace } = useRouter();
  const { toast } = useToast();
  const assessmentContext = useContext(AssessmentContext);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (
        !assessmentContext.document ||
        !assessmentContext.numberOfQuestions ||
        assessmentContext.difficultyLevel == undefined
        // !authenticatedUser
      ) {
        replace("/create");
      } else {
        generateAssessmentAndSaveToDB();
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const generateAssessmentAndSaveToDB = async () => {
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
    formData.append("questions", String(assessmentContext.numberOfQuestions));
    formData.append("marks", String(assessmentContext.totalMarks));
    formData.append(
      "difficulty-level",
      String(assessmentContext.difficultyLevel)
    );
    if (assessmentContext.requirements) {
      formData.append("requirements", assessmentContext.requirements as string);
    }
    try {
      const data = await fetch("/api/generate/assessment", {
        method: "POST",
        body: formData,
      });
      const assessmentJson = await data.json();
      const assessmentObject: GeneratedTestType = assessmentJson;

      const newAssessmentNanoId = await createAssessment(
        {
          title: assessmentObject.title,
          questions: assessmentObject.questions,
          duration: assessmentContext.duration as
            | "15"
            | "30"
            | "45"
            | "60"
            | "90"
            | "120"
            | "150"
            | "180",
          instructions: assessmentContext.instructions,
          credentials: assessmentContext.credentials,
          difficultyLevel: assessmentContext.difficultyLevel,
          generationRequirements: assessmentContext.requirements,
        },
        assessmentObject.documentId,
        assessmentObject.numberOfChunks
      );

      if (newAssessmentNanoId) {
        toast({
          title: "Assessment created successfully",
        });
        assessmentContext.document = undefined;
        replace(`/quizzes/${newAssessmentNanoId}`);
      } else {
        toast({
          description: "Something went wrong while creating the assessment",
          title: "Error",
          variant: "destructive",
        });
        assessmentContext.document = undefined;
      }
    } catch (err) {
      console.log(err);
      toast({
        description: "Something went wrong while generating the assessment",
        title: "Error",
        variant: "destructive",
      });
      assessmentContext.document = undefined;
    }
  };
  return (
    <AssessmentProvider>
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white opacity-30">
        <RiLoader3Fill className="w-20 h-20 animate-spin" />
        <p className="text-lg font-medium">Generating questions...</p>
        {(assessmentContext.document?.size as number) > 10000000 && (
          <p className="text-sm">
            The bigger the file, the longer it will take
          </p>
        )}
      </div>
    </AssessmentProvider>
  );
}
