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
  context: string;
  difficulty_level: number;
  generation_requirements: string | undefined;
  submissions: {
    nano_id: string;
    credentials: string[];
    submission_time: Date | undefined;
    status: "submitted" | "graded";
  }[];
  modified_at: Date;
}[];
export default async function getAdminAssessmentData(nanoId: string) {
  const supabase = CreateServerClient();

  console.log("Fetching authenticated user...");

  const authenticatedUser = (await supabase.auth.getUser()).data.user;

  console.log(
    "Fetching admin assessment data for user of ID " +
      authenticatedUser?.id +
      " and assessment of nano ID " +
      nanoId +
      "..."
  );

  const { data, error } = await supabase
    .from("assessments")
    .select(
      "id, user_id, nano_id, title, questions, duration, instructions, credentials, context, difficulty_level, generation_requirements, submissions:submissions!assessment_id (nano_id, credentials, submission_time, status), modified_at"
    )
    .eq("nano_id", nanoId)
    .eq("user_id", authenticatedUser?.id)
    .or("status.eq.submitted,status.eq.graded", {
      referencedTable: "submissions",
    })
    .order("submission_time", {
      referencedTable: "submissions",
      ascending: false,
    })
    .returns<AssessmentDataType>();

  if (error || data.length === 0) {
    console.error(
      "Error while getting the admin assessment data: " + error
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
  console.log("Parsed questions successfully!");

  console.log("Fetched admin assessment data successfully!");

  return {
    id: data[0].id,
    nanoId: data[0].nano_id,
    title: data[0].title,
    duration: data[0].duration,
    instructions: data[0].instructions,
    credentials: data[0].credentials,
    questions: questionsObject,
    context: data[0].context,
    difficultyLevel: data[0].difficulty_level,
    generationRequirements: data[0].generation_requirements,
    submissions: data[0].submissions.map((submission) => ({
      nanoId: submission.nano_id,
      credentials: submission.credentials,
      submissionTime: submission.submission_time,
      submissionStatus: submission.status,
    })),
    modifiedAt: data[0].modified_at,
  };
}
