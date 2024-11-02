import { CreateServerClient } from "@/utils/supabase/serverClient";
import { redirect } from "next/navigation";
import Link from "next/link";
import getAllUserAssessments from "../api/assessments/fetch/getAllUserAssessments";
import { Button } from "@/components/ui/button";
import { FiPlus } from "react-icons/fi";

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
      <div className="w-full max-w-lg flex justify-between items-center p-5 mx-auto">
        <p className="text-2xl font-bold">All assessments</p>
        <Link href={"/edit"}>
          <Button>
            <span>
              <FiPlus className="w-5 h-5 mr-2" />
            </span>
            New
          </Button>
        </Link>
      </div>

      {allUserAssessments ? (
        allUserAssessments.length === 0 ? (
          <p>You have not created any assessments...yet</p>
        ) : (
          <div className="flex flex-col divide-y max-w-lg mx-auto">
            {allUserAssessments.map((assessment) => (
              <Link
                key={assessment.id}
                href={`/quizzes/${assessment.nanoId}`}
                className="w-full flex flex-col gap-1 p-3 rounded-md hover:bg-black/5"
              >
                <p className="max-w-full truncate">{assessment.title}</p>
                <p className="text-sm text-black/70">
                  {assessment.submissions.length} submission
                  {assessment.submissions.length === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
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
