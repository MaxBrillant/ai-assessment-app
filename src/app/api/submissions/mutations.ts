"use server";

import {
  answersType,
  submissionSchema,
} from "@/app/validation/submissionValidation";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import { nanoid } from "nanoid";

export async function createSubmission(
  assessmentId: number,
  credentials: string[]
) {
  console.log("Validating the submission...");
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

  console.log(
    "Creating the submission of assessment of ID " + assessmentId + "..."
  );

  const { error } = await CreateServerClient()
    .from("submissions")
    .insert({
      nano_id: nanoId,
      assessment_id: assessmentId,
      answers: JSON.stringify([]),
      credentials: credentials,
    });

  if (error) {
    console.error("Error while creating the submission: ", error.message);
    return undefined;
  }

  console.log("Submission created successfully!");

  return nanoId;
}

export async function updateSubmissionAnswers(
  submissionId: number,
  answers: answersType
) {
  console.log("Validating the submission answers...");

  try {
    submissionSchema.parse({
      submission: answers,
      credentials: [],
    });
  } catch (err) {
    console.error("Error while updating the submission answers: " + err);
    return undefined;
  }

  console.log(
    "Updating the submission answers of submission of ID " +
      submissionId +
      "..."
  );

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

  console.log("Submission answers updated successfully!");
  return data;
}

export async function submitAssessment(submissionId: number) {
  console.log(
    "Submitting the assessment of submission of ID " + submissionId + "..."
  );
  const { data, error } = await CreateServerClient()
    .from("submissions")
    .update({
      status: "submitted",
      submission_time: new Date(),
    })
    .eq("id", submissionId)
    .select("nano_id");

  if (error) {
    console.error("Error while submitting the assessment: ", error.message);
    return undefined;
  }

  console.log("Assessment submitted successfully!");

  return data;
}

export async function deleteSubmission(submissionId: number) {
  console.log(
    "Deleting the submission of submission of ID " + submissionId + "..."
  );

  const { error } = await CreateServerClient()
    .from("submissions")
    .delete()
    .eq("id", submissionId);

  if (error) {
    console.error("Error while deleting a submission: ", error.message);
    return undefined;
  }

  console.log("Submission deleted successfully!");

  return 1;
}

export async function startResubmission(submissionId: number) {
  console.log(
    "Starting the resubmission of submission of ID " + submissionId + "..."
  );

  const { data, error } = await CreateServerClient()
    .from("submissions")
    .update({
      status: "resubmission-allowed",
      submission_time: null,
      resubmission_started_at: new Date(),
    })
    .eq("id", submissionId)
    .select("nano_id");

  if (error) {
    console.error("Error while creating a resubmission: ", error.message);
    return undefined;
  }

  console.log("Resubmission created successfully!");

  return data;
}
