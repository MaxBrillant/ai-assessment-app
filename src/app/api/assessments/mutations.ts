"use server";

import { QuestionType } from "@/app/components/question";
import { assessmentSchema } from "@/app/validation/assessmentValidation";
import { questionSchema } from "@/app/validation/questionValidation";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import { nanoid } from "nanoid";
import { z } from "zod";
import { sendNewAssessmentCreatedEmail } from "../email/sendEmail";

export async function createAssessment(
  data: z.infer<typeof assessmentSchema>,
  documentId: string,
  numberOfChunks: number
) {
  try {
    console.log("Validating the assessment data...");

    try {
      assessmentSchema.parse(data);
    } catch (err) {
      throw new Error("Error while validating the assessment data: " + err);
    }

    const supabase = CreateServerClient();

    console.log("Fetching authenticated user...");

    const userId = (await supabase.auth.getUser()).data.user?.id;
    const userEmail = (await supabase.auth.getUser()).data.user?.email;
    const nanoId = nanoid();

    if (!userId) {
      throw new Error(
        "Error while creating the assessment: no authenticated user could be found"
      );
    }

    console.log("Creating the assessment of user of ID " + userId + "...");

    const { error } = await supabase.from("assessments").insert({
      nano_id: nanoId,
      user_id: userId,
      user_email: userEmail,
      title: data.title,
      questions: data.questions,
      document_id: documentId,
      number_of_chunks: numberOfChunks,
      difficulty_level: data.difficultyLevel,
      generation_requirements: data.generationRequirements,
      duration: data.duration,
      instructions: data.instructions,
      credentials: data.credentials,
    });

    if (error) {
      throw new Error("Error while creating the assessment: " + error.message);
    }

    console.log("Assessment created successfully");

    await sendNewAssessmentCreatedEmail(
      userEmail as string,
      data.title,
      window.location.origin + `/dashboard/${nanoId}`
    );

    return nanoId;
  } catch (err) {
    throw new Error("Error while creating the assessment: " + err);
  }
}

export async function updateAssessmentQuestions(
  id: number,
  questions: QuestionType[]
) {
  try {
    console.log("Validating the assessment questions...");

    try {
      const questionListSchema = z.array(questionSchema);
      questionListSchema.parse(questions);
    } catch (err) {
      throw new Error(
        "Error while validating the assessment questions: " + err
      );
    }

    const supabase = CreateServerClient();

    console.log("Fetching authenticated user...");

    const userId = (await supabase.auth.getUser()).data.user?.id;

    if (!userId) {
      throw new Error(
        "Error while updating the assessment questions: no authenticated user could be found"
      );
    }

    console.log(
      "Updating the assessment questions of assessment of ID " + id + "..."
    );

    const { error } = await supabase
      .from("assessments")
      .update({
        questions: JSON.stringify(questions),
        modified_at: new Date(),
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new Error(
        "Error while updating the assessment questions: " + error.message
      );
    }

    console.log("Assessment questions updated successfully");
  } catch (err) {
    throw new Error("Error while updating the assessment questions: " + err);
  }
}

export async function updateAssessmentRules(
  id: number,
  title: string,
  duration: string,
  instructions: string | undefined
) {
  try {
    console.log("Validating the assessment rules...");

    try {
      const questionListSchema = assessmentSchema.pick({
        title: true,
        duration: true,
        instructions: true,
      });
      questionListSchema.parse({
        title: title,
        duration: duration,
        instructions: instructions,
      });
    } catch (err) {
      throw new Error("Error while validating the assessment rules: " + err);
    }

    const supabase = CreateServerClient();

    console.log("Fetching authenticated user...");

    const userId = (await supabase.auth.getUser()).data.user?.id;

    if (!userId) {
      throw new Error(
        "Error while updating the assessment rules: no authenticated user could be found"
      );
    }

    console.log(
      "Updating the assessment rules of assessment of ID " + id + "..."
    );

    const { error } = await supabase
      .from("assessments")
      .update({
        title: title,
        duration: duration,
        instructions: instructions,
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new Error(
        "Error while updating the assessment rules: " + error.message
      );
    }

    console.log("Assessment rules updated successfully");
  } catch (err) {
    throw new Error("Error while updating the assessment rules: " + err);
  }
}

export async function publishAssessment(
  id: number,
  title: string,
  duration: string,
  instructions: string | undefined,
  credentials: string[]
) {
  try {
    console.log("Validating the assessment data...");

    try {
      const questionListSchema = assessmentSchema.pick({
        title: true,
        duration: true,
        instructions: true,
        credentials: true,
      });
      questionListSchema.parse({
        title: title,
        duration: duration,
        instructions: instructions,
        credentials: credentials,
      });
    } catch (err) {
      throw new Error("Error while validating the assessment data: " + err);
    }

    const supabase = CreateServerClient();

    console.log("Fetching authenticated user...");

    const userId = (await supabase.auth.getUser()).data.user?.id;

    if (!userId) {
      throw new Error(
        "Error while publishing the assessment: no authenticated user could be found"
      );
    }

    console.log("Publishing the assessment of ID " + id + "...");

    const { data, error } = await supabase
      .from("assessments")
      .update({
        title: title,
        duration: duration,
        instructions: instructions,
        credentials: credentials,
        status: "public",
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select("nano_id");

    if (error) {
      throw new Error(
        "Error while publishing the assessment: " + error.message
      );
    }

    console.log("Assessment rules updated successfully");
    return data[0].nano_id as string;
  } catch (err) {
    throw new Error("Error while publishing the assessment: " + err);
  }
}
