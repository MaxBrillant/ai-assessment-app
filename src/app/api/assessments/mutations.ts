"use server";

import { QuestionType } from "@/app/components/question";
import { assessmentSchema } from "@/app/validation/assessmentValidation";
import { questionSchema } from "@/app/validation/questionValidation";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import { nanoid } from "nanoid";
import { z } from "zod";

export async function createAssessment(formdata: FormData) {
  console.log("Validating the assessment data...");

  try {
    assessmentSchema.parse({
      title: formdata.get("title"),
      questions: JSON.parse(
        formdata.get("questions")?.toString() as string
      ) as QuestionType[],
      context: formdata.get("context"),
      difficultyLevel: Number(formdata.get("difficultyLevel")?.toString()),

      generationRequirements:
        formdata.get("requirements") === ""
          ? undefined
          : formdata.get("requirements"),

      duration: formdata.get("duration"),

      instructions:
        formdata.get("instructions") === ""
          ? undefined
          : formdata.get("instructions"),
      credentials: JSON.parse(
        formdata.get("credentials")?.toString() as string
      ),
    });
  } catch (err) {
    console.error("Error while creating the assessment: " + err);
    return undefined;
  }

  const supabase = CreateServerClient();

  console.log("Fetching authenticated user...");

  const userId = (await supabase.auth.getUser()).data.user?.id;
  const nanoId = nanoid();

  if (!userId) {
    console.error(
      "Error while creating the assessment: no authenticated user could be found"
    );
    return undefined;
  }

  console.log("Creating the assessment of user of ID " + userId + "...");

  const { error } = await supabase.from("assessments").insert({
    nano_id: nanoId,
    user_id: userId,
    title: formdata.get("title"),
    questions: formdata.get("questions"),
    context: formdata.get("context"),
    difficulty_level: formdata.get("difficultyLevel"),

    generation_requirements:
      formdata.get("requirements") === "" ? null : formdata.get("requirements"),

    duration: formdata.get("duration"),

    instructions:
      formdata.get("instructions") === "" ? null : formdata.get("instructions"),

    credentials: JSON.parse(formdata.get("credentials") as string) as string[],
  });

  if (error) {
    console.error("Error while creating the assessment: ", error.message);
    return undefined;
  }

  console.log("Assessment created successfully");

  return nanoId;
}

export async function updateAssessmentQuestions(
  id: number,
  questions: QuestionType[]
) {
  console.log("Validating the assessment questions...");

  try {
    const questionListSchema = z.array(questionSchema);
    questionListSchema.parse(questions);
  } catch (err) {
    console.error("Error while updating the assessment questions: " + err);
    return undefined;
  }

  const supabase = CreateServerClient();

  console.log("Fetching authenticated user...");

  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    console.error(
      "Error while updating the assessment questions: no authenticated user could be found"
    );
    return undefined;
  }

  console.log(
    "Updating the assessment questions of assessment of ID " + id + "..."
  );

  const { data, error } = await supabase
    .from("assessments")
    .update({
      questions: JSON.stringify(questions),
      modified_at: new Date(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("nano_id");

  if (error) {
    console.error(
      "Error while updating the assessment questions: ",
      error.message
    );
    return undefined;
  }

  console.log("Assessment questions updated successfully");

  return data[0].nano_id as string;
}

export async function updateAssessmentRules(
  id: number,
  title: string,
  duration: string,
  instructions: string | undefined
) {
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
    console.error("Error while updating the assessment rules: " + err);
    return undefined;
  }

  const supabase = CreateServerClient();

  console.log("Fetching authenticated user...");

  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    console.error(
      "Error while updating the assessment rules: no authenticated user could be found"
    );
    return undefined;
  }

  console.log(
    "Updating the assessment rules of assessment of ID " + id + "..."
  );

  const { data, error } = await supabase
    .from("assessments")
    .update({
      title: title,
      duration: duration,
      instructions: instructions,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("nano_id");

  if (error) {
    console.error("Error while updating the assessment rules: ", error.message);
    return undefined;
  }

  console.log("Assessment rules updated successfully");
  return data[0].nano_id;
}
