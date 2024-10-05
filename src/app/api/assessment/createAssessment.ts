"use server";

import { assessmentSchema } from "@/app/validation/assessmentValidation";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import { nanoid } from "nanoid";

export async function CreateAssessment(formdata: FormData) {
  try {
    assessmentSchema.parse({
      title: formdata.get("title"),
      questions: JSON.parse(formdata.get("questions")?.toString() as string),
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
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const nanoId = nanoid();

  if (!userId) {
    console.error(
      "Error while creating the assessment: no authenticated user could be found"
    );
    return undefined;
  }
  const { error } = await supabase.from("quizzes").insert({
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

  return nanoId;
}
