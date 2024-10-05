"use server";

import { answersType, submissionSchema } from "@/app/validation/submissionValidation";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import { nanoid } from "nanoid";

export async function CreateSubmission(quizId: number, credentials: string[]) {
  try {
    submissionSchema.parse({
      submission: [],
      credentials: credentials,
    });
  } catch (err) {
    console.error("Error while creating the submission: " + err);
    return undefined;
  }

  const nanoId = nanoid();

  const { error } = await CreateServerClient()
    .from("submissions")
    .insert({
      nano_id: nanoId,
      quiz_id: quizId,
      answers: JSON.stringify([]),
      credentials: credentials,
    });

  if (error) {
    console.error("Error while creating the submission: ", error.message);
    return undefined;
  }

  return nanoId;
}

export async function UpdateSubmissionAnswers(
  submissionId: number,
  answers: answersType
) {
  try {
    submissionSchema.parse({
      submission: answers,
      credentials: [],
    });
  } catch (err) {
    console.error("Error while updating the submission answers: " + err);
    return undefined;
  }

  const { data, error } = await CreateServerClient()
    .from("submissions")
    .update({
      answers: JSON.stringify(answers),
    })
    .eq("id", submissionId)
    .select("nano_id");

  if (error) {
    console.error(
      "Error while updating the submission answers: ",
      error.message
    );
    return undefined;
  }

  return data;
}
