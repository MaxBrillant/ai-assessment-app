"use server";

import { answersType } from "@/app/validation/submissionValidation";
import { CreateServerClient } from "@/utils/supabase/serverClient";

type submissionDataType = {
  id: number;
  nano_id: string;
  assessment_id: number;
  answers: string;
  status:
    | "pending-submission"
    | "submitted"
    | "resubmission-allowed"
    | "graded";
  submission_time: Date | undefined;
  created_at: Date;
  resubmission_started_at: Date | undefined;
}[];

export default async function getSubmissionData(
  assessmentId: number,
  submissionNanoId: string
) {
  try {
    const supabase = CreateServerClient();

    console.log(
      "Fetching submission data of submission of nano ID " +
        submissionNanoId +
        "..."
    );

    const { data, error } = await supabase
      .from("submissions")
      .select(
        "id, nano_id, assessment_id, answers, status, submission_time, created_at, resubmission_started_at"
      )
      .eq("nano_id", submissionNanoId)
      .eq("assessment_id", assessmentId)
      .returns<submissionDataType>();

    if (error || data.length === 0) {
      throw new Error(
        "Error while getting the submission data: " + error
          ? error?.message
          : "No data returned"
      );
    }

    console.log("Parsing answers...");

    const answersObject: answersType = JSON.parse(data[0].answers);

    console.log("Answers parsed successfully!");

    console.log("Submission data fetched successfully!");

    return {
      id: data[0].id,
      nanoId: data[0].nano_id,
      assessmentId: data[0].assessment_id,
      answers: answersObject,
      submissionStatus: data[0].status,
      submissionTime: data[0].submission_time,
      created_at: data[0].created_at,
      resubmissionStartedAt: data[0].resubmission_started_at,
    };
  } catch (error) {
    throw new Error("Error while getting the submission data: " + error);
  }
}

type credentialsType = { id: number; credentials: string[] }[];
export async function checkIfCredentialsExists(id: number, credential: string) {
  try {
    const supabase = CreateServerClient();

    console.log("Checking for existant credentials...");

    const { data, error } = await supabase
      .from("submissions")
      .select("id, assessment_id, credentials")
      .eq("assessment_id", id)
      .contains("credentials", [credential])
      .returns<credentialsType>();

    if (error) {
      throw new Error(
        "Error while checking for existant credentials: " + error?.message
      );
    }

    console.log("Credentials check successful!");

    if (data.length === 0) {
      const existingUser = data.find(
        (user) => user.credentials[0].toLowerCase() === credential.toLowerCase()
      );
      return existingUser ? true : false;
    } else {
      return false;
    }
  } catch (error) {
    throw new Error("Error while checking for existant credentials: " + error);
  }
}
