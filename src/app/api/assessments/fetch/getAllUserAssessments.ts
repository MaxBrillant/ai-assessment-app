"use server";

import { CreateServerClient } from "@/utils/supabase/serverClient";

type AssessmentDataType = {
  id: number;
  user_id: string;
  nano_id: string;
  title: string;
  submissions: { id: number; status: "submitted" | "graded" }[];
  modified_at: Date;
}[];
export default async function getAllUserAssessments() {
  const supabase = CreateServerClient();

  console.log("Fetching authenticated user...");

  const authenticatedUser = await supabase.auth
    .getUser()
    .then((user) => user.data.user);

  console.log(
    "Fetching all user assessments for user of ID " +
      authenticatedUser?.id +
      "..."
  );
  const { data, error } = await supabase
    .from("assessments")
    .select(
      `id, user_id, nano_id, title, submissions:submissions!assessment_id (id, status), modified_at`
    )
    .eq("user_id", authenticatedUser?.id)
    .or("status.eq.submitted,status.eq.graded", {
      referencedTable: "submissions",
    })
    .order("modified_at", { ascending: false })
    .returns<AssessmentDataType>();

  if (error) {
    console.error("Error while getting all assessments: " + error?.message);
    return undefined;
  }

  console.log("Successfully fetched all user assessments");

  return data.map((assessment) => ({
    id: assessment.id,
    nanoId: assessment.nano_id,
    title: assessment.title,
    submissions: assessment.submissions,
    modifiedAt: assessment.modified_at,
  }));
}
