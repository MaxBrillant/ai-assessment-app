"use server";

import { QuestionType } from "@/app/components/question";
import { CreateServerClient } from "@/utils/supabase/serverClient";

type AssessmentDataType = {
  nano_id: string;
  title: string;
  duration: number;
  questions: QuestionType[];
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
        numberOfQuestions: assessment.questions.length,
      };
    });
  } catch (err) {
    throw new Error(
      `Error while fetching public assessments info, the error is: ${err}`
    );
  }
}
