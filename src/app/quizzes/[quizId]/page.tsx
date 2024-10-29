import { CreateServerClient } from "@/utils/supabase/serverClient";
import { redirect } from "next/navigation";
import AssessmentTabs from "./assessmentTabs";
import getAdminAssessmentData from "@/app/api/assessments/fetch/getAdminAssessmentData";

export default async function Assessment({
  params,
}: {
  params: { quizId: string };
}) {
  const supabase = CreateServerClient();
  const authenticatedUser = supabase.auth
    .getUser()
    .then((user) => user.data.user);

  if (!authenticatedUser) {
    redirect("/login?redirect=/quizzes/" + params.quizId);
  }

  const assessmentNanoId = params.quizId;
  const adminAssessmentData = await getAdminAssessmentData(assessmentNanoId);

  return adminAssessmentData ? (
    <div>
      <div>
        <p className="text-lg px-3 py-1">{adminAssessmentData.title}</p>
        <AssessmentTabs
          id={adminAssessmentData.id}
          title={adminAssessmentData.title}
          duration={adminAssessmentData.duration}
          instructions={adminAssessmentData.instructions}
          credentials={adminAssessmentData.credentials}
          questions={adminAssessmentData.questions}
          submissions={adminAssessmentData.submissions}
          context={adminAssessmentData.context}
          difficultyLevel={adminAssessmentData.difficultyLevel}
          requirements={adminAssessmentData.generationRequirements}
        />
      </div>
    </div>
  ) : (
    <div>
      <p>
        There was an error while fetching this assessment. Try refreshing the
        page.
      </p>
    </div>
  );
}
