"use client";

import { createAssessment } from "@/app/api/assessments/mutations";
import { sendNewAssessmentCreatedEmail } from "@/app/api/email/sendEmail";
import { generateAssessmentQuestions } from "@/app/api/generate/assessment/generateAssessmentQuestions";
import {
  AssessmentContext,
  AssessmentProvider,
} from "@/app/context/assessmentContext";
import Loading from "@/app/loading";
import { useToast } from "@/hooks/use-toast";
import { CreateBrowserClient } from "@/utils/supabase/browserClient";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

export default function Generate() {
  const { replace } = useRouter();
  const { toast } = useToast();
  const assessmentContext = useContext(AssessmentContext);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (
        !assessmentContext.documentId ||
        !assessmentContext.numberOfQuestions ||
        assessmentContext.difficultyLevel == undefined
        // !authenticatedUser
      ) {
        replace("/create");
      } else {
        generateQuestionsAndCreateNewAssessment();
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const generateQuestionsAndCreateNewAssessment = async () => {
    try {
      const generatedQuestions = await generateAssessmentQuestions(
        assessmentContext.documentId as string,
        assessmentContext.numberOfQuestions,
        assessmentContext.totalMarks,
        assessmentContext.difficultyLevel,
        assessmentContext.requirements,
        assessmentContext.numberOfChunks
      );

      const newAssessmentNanoId = await createAssessment(
        {
          title: assessmentContext.title,
          questions: generatedQuestions,
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
        assessmentContext.documentId as string,
        assessmentContext.numberOfChunks
      );
      toast({
        title: "Assessment created successfully",
      });
      assessmentContext.documentId = undefined;
      replace(`/dashboard/${newAssessmentNanoId}`);
    } catch (err) {
      console.log(err);
      toast({
        description: "Something went wrong while creating your assessment",
        title: "Error",
        variant: "destructive",
      });
      replace("/create");
      assessmentContext.documentId = undefined;
    }
  };
  return (
    <AssessmentProvider>
      <Loading message="Generating questions..." />
    </AssessmentProvider>
  );
}
