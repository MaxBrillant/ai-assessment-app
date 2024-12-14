"use server";

import {
  answersType,
  submissionSchema,
} from "@/app/validation/submissionValidation";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import { nanoid } from "nanoid";
import { sendNewSubmissionReceivedEmail } from "../email/sendEmail";

export async function createSubmission(
  assessmentId: number,
  credentials: string[]
) {
  try {
    console.log("Validating the submission...");
    try {
      submissionSchema.parse({
        submission: [],
        credentials: credentials,
      });
    } catch (err) {
      throw new Error("Error while validating the submission: " + err);
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
      throw new Error("Error while creating the submission: " + error.message);
    }

    console.log("Submission created successfully!");

    return nanoId;
  } catch (err) {
    throw new Error("Error while creating the submission: " + err);
  }
}

export async function updateSubmissionAnswers(
  submissionId: number,
  answers: answersType
) {
  try {
    console.log("Validating the submission answers...");

    try {
      submissionSchema.parse({
        submission: answers,
        credentials: [],
      });
    } catch (err) {
      throw new Error("Error while updating the submission answers: " + err);
    }

    console.log(
      "Updating the submission answers of submission of ID " +
        submissionId +
        "..."
    );

    const { error } = await CreateServerClient()
      .from("submissions")
      .update({
        answers: JSON.stringify(answers),
      })
      .eq("id", submissionId)
      .select("nano_id");

    if (error) {
      throw new Error(
        "Error while updating the submission answers: " + error.message
      );
    }

    console.log("Submission answers updated successfully!");
  } catch (err) {
    throw new Error("Error while updating the submission answers: " + err);
  }
}

export async function submitAssessment(submissionId: number) {
  try {
    console.log("Submitting the submission of ID " + submissionId + "...");
    const { data, error } = await CreateServerClient()
      .from("submissions")
      .update({
        status: "submitted",
        submission_time: new Date(),
      })
      .eq("id", submissionId)
      .select("nano_id, assessments(nano_id, title, user_email)")
      .returns<
        {
          nano_id: string;
          assessments: { nano_id: string; title: string; user_email: string };
        }[]
      >();

    if (error) {
      throw new Error(
        "Error while submitting the submission: " + error.message
      );
    }

    console.log("Submission submitted successfully!");

    await sendNewSubmissionReceivedEmail(
      data[0].assessments.user_email,
      data[0].assessments.title,
      "https://getquizdom.com/dashboard/" +
        data[0].assessments.nano_id +
        "?submissionId=" +
        data[0].nano_id
    );
  } catch (err) {
    throw new Error("Error while submitting the submission: " + err);
  }
}

export async function deleteSubmission(submissionId: number) {
  try {
    console.log(
      "Deleting the submission of submission of ID " + submissionId + "..."
    );

    const { error } = await CreateServerClient()
      .from("submissions")
      .delete()
      .eq("id", submissionId);

    if (error) {
      throw new Error("Error while deleting a submission: " + error.message);
    }

    console.log("Submission deleted successfully!");

    return true;
  } catch (err) {
    throw new Error("Error while deleting a submission: " + err);
  }
}

export async function startResubmission(submissionId: number) {
  try {
    console.log(
      "Starting the resubmission of submission of ID " + submissionId + "..."
    );

    const { error } = await CreateServerClient()
      .from("submissions")
      .update({
        status: "resubmission-allowed",
        submission_time: null,
        resubmission_started_at: new Date(),
      })
      .eq("id", submissionId)
      .select("nano_id");

    if (error) {
      throw new Error("Error while creating a resubmission: " + error.message);
    }

    console.log("Resubmission created successfully!");
  } catch (err) {
    throw new Error("Error while creating a resubmission: " + err);
  }
}
