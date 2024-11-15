"use server";

import { QuestionType } from "@/app/components/question";
import { CreateServerClient } from "@/utils/supabase/serverClient";

type AssessmentDataType = {
  id: number;
  nano_id: string;
  title: string;
  status: "private" | "public" | "closed";
  duration: number;
  instructions: string | undefined;
  credentials: string[];
  questions: string;
  document_id: string;
  number_of_chunks: number;
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
export async function getAdminAssessmentData(nanoId: string) {
  try {
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
        "id, user_id, nano_id, title, status, questions, document_id, number_of_chunks, duration, instructions, credentials, difficulty_level, generation_requirements, submissions:submissions!assessment_id (nano_id, credentials, submission_time, status), modified_at"
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
      throw new Error(
        "Error while getting the admin assessment data: " + error
          ? error?.message
          : "No data returned"
      );
    }

    console.log("Parsing questions...");

    const questionsObject: QuestionType[] =
      typeof data[0].questions === "string"
        ? JSON.parse(data[0].questions)
        : data[0].questions;
    console.log("Parsed questions successfully!");

    console.log("Fetched admin assessment data successfully!");

    return {
      id: data[0].id,
      nanoId: data[0].nano_id,
      title: data[0].title,
      status: data[0].status,
      duration: data[0].duration,
      instructions: data[0].instructions,
      credentials: data[0].credentials,
      questions: questionsObject,
      documentId: data[0].document_id,
      numberOfChunks: data[0].number_of_chunks,
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
  } catch (error) {
    throw new Error("Error while getting the admin assessment data: " + error);
  }
}
