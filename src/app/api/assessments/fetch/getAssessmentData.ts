"use server";

import { questionSchema } from "@/app/validation/questionValidation";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import { z } from "zod";

type AssessmentDataType = {
  id: number;
  nano_id: string;
  title: string;
  duration: number;
  instructions: string | undefined;
  credentials: string[];
  questions: string;
  modified_at: Date;
}[];
export default async function getAssessmentData(nanoId: string) {
  const supabase = CreateServerClient();

  console.log("Fetching assessment data for assessment of nano ID " + nanoId);

  const { data, error } = await supabase
    .from("assessments")
    .select(
      "id, nano_id, title, questions, duration, instructions, credentials, modified_at"
    )
    .eq("nano_id", nanoId)
    .returns<AssessmentDataType>();

  if (error || data.length === 0) {
    console.error(
      "Error while getting the assessment data: " + error
        ? error?.message
        : "No data returned"
    );
    return undefined;
  }

  console.log("Parsing questions...");

  const schema = questionSchema;
  const questionsObject: z.infer<typeof schema>[] = JSON.parse(
    data[0].questions
  );

  const questionsWithoutAnswers = questionsObject.map((question) => {
    const { answer, ...questionWithoutAnswer } = question;
    return questionWithoutAnswer;
  });

  console.log("Questions parsed");

  console.log("Successfully fetched assessment data");

  return {
    id: data[0].id,
    nanoId: data[0].nano_id,
    title: data[0].title,
    duration: data[0].duration,
    instructions: data[0].instructions,
    credentials: data[0].credentials,
    questions: questionsWithoutAnswers,
    modifiedAt: data[0].modified_at,
  };
}
