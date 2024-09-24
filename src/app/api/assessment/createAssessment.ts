"use server";

import { CreateServerClient } from "@/utils/supabase/serverClient";

export async function CreateAssessment(formdata: FormData) {
  const supabase = await CreateServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    console.log(
      "Error while creating the assessment: no authenticated user could be found"
    );
    return false;
  }
  const { error } = await CreateServerClient()
    .from("quizzes")
    .insert({
      user_id: userId,
      title: formdata.get("title"),
      questions: formdata.get("questions"),
      context: formdata.get("context"),
      difficulty_level: formdata.get("difficultyLevel"),

      generation_requirements:
        formdata.get("requirements") === ""
          ? null
          : formdata.get("requirements"),

      duration: formdata.get("duration"),

      instructions:
        formdata.get("instructions") === ""
          ? null
          : formdata.get("instructions"),

      credentials: JSON.parse(
        formdata.get("credentials") as string
      ) as string[],
    });

  if (error) {
    console.log("Error while creating the assessment: ", error);
    return false;
  }

  return true;
}
