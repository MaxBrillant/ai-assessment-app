"use server";

import { answersType } from "@/app/validation/submissionValidation";
import { CreateServerClient } from "@/utils/supabase/serverClient";

type submissionDataType = {
  id: number;
  nano_id: string;
  quiz_id: number;
  answers: string;
  status: "pending-submission"|"submitted"|"resubmission-allowed"
  created_at: Date;
}[];

export default async function getSubmissionData(
  quizId: number,
  submissionNanoId: string
) {
  const supabase = CreateServerClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("id, nano_id, quiz_id, answers, status, created_at")
    .eq("nano_id", submissionNanoId)
    .eq("quiz_id", quizId)
    .returns<submissionDataType>();

  if (error || data.length === 0) {
    console.error(
      "Error while getting the submission data: " + error
        ? error?.message
        : "No data returned"
    );
    return undefined;
  }

  const answersObject: answersType = JSON.parse(data[0].answers);

  return {
    id: data[0].id,
    nanoId: data[0].nano_id,
    quizId: data[0].quiz_id,
    answers: answersObject,
    submissionStatus: data[0].status,
    created_at: data[0].created_at,
  };
}
