"use server";

import { QuestionType } from "@/app/components/question";
import { questionSchema } from "@/app/validation/questionValidation";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import { z } from "zod";

type AssessmentDataType = {
  nano_id: string;
  title: string;
  duration: number;
  questions: string;
  difficulty_level: number;
}[];
export default async function getTenAssessmentsInfo() {
  const supabase = CreateServerClient();

  console.log("Fetching ten assessments' info...");

  const { data, error } = await supabase
    .from("assessments")
    .select("id, nano_id, title, status, questions, duration, difficulty_level")
    .eq("status", "public")
    .limit(10)
    .returns<AssessmentDataType>();

  if (error) {
    console.error(
      "Error while getting the assessment data: " + error
        ? error?.message
        : "No data returned"
    );
    return undefined;
  }

  console.log("Successfully fetched ten assessments' info");

  return data.map((assessment) => {
    return {
      nanoId: assessment.nano_id,
      title: assessment.title,
      duration: assessment.duration,
      difficultyLevel: assessment.difficulty_level,
      numberOfQuestions: (JSON.parse(assessment.questions) as QuestionType[])
        .length,
    };
  });
}
