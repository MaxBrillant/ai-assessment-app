import { CreateServerClient } from "@/utils/supabase/serverClient";
import { redirect } from "next/navigation";
import Link from "next/link";
import getAllUserAssessments from "../api/assessments/fetch/getAllUserAssessments";
import { Button } from "@/components/ui/button";

export default async function Assessments() {
  const supabase = CreateServerClient();
  const authenticatedUser = await supabase.auth
    .getUser()
    .then((user) => user.data.user);

  if (!authenticatedUser) {
    redirect("/login?redirect=/quizzes");
  }

  const allUserAssessments = await getAllUserAssessments();

  return (
    <div>
      <p>All assessments</p>
      {allUserAssessments ? (
        allUserAssessments.length === 0 ? (
          <p>You have not created any assessments...yet</p>
        ) : (
          allUserAssessments.map((assessment) => (
            <Link
              key={assessment.id}
              href={`/quizzes/${assessment.nanoId}`}
            >
              <div>
                <p>{assessment.title}</p>
                <p>
                  {assessment.submissions.length} submission
                  {assessment.submissions.length === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ))
        )
      ) : (
        <div>
          <p>
            There was an error while fetching your assessments. Try refreshing
            this page.
          </p>
          <Link href="/quizzes">
            <Button>Refresh</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
