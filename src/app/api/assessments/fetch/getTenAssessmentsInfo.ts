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
export async function getPublicAssessmentsInfo() {
  try {
    const supabase = CreateServerClient();

    console.log("Fetching public assessments info...");

    const { data, error } = await supabase
      .from("assessments")
      .select(
        "id, nano_id, title, status, questions, duration, difficulty_level"
      )
      .eq("status", "public")
      .order("modified_at", { ascending: false })
      .limit(10)
      .returns<AssessmentDataType>();

    if (error) {
      throw new Error(
        "Error while fetching public assessments info: " + error.message
      );
    }

    console.log("Successfully fetched public assessments info");

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
  } catch (err) {
    throw new Error(
      `Error while fetching public assessments info, the error is: ${err}`
    );
  }
}
