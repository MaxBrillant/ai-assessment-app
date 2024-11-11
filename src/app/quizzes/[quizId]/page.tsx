import { CreateServerClient } from "@/utils/supabase/serverClient";
import { redirect } from "next/navigation";
import AssessmentTabs from "./assessmentTabs";
import getAdminAssessmentData from "@/app/api/assessments/fetch/getAdminAssessmentData";
import { calculateTotalMarks } from "@/utils/calculateTotalMarks";
import { Button } from "@/components/ui/button";
import { IoShareOutline } from "react-icons/io5";
import ExportAssessment from "./exportAssessment";
import PublishingPopup from "./publishingPopup";
import SharePopup from "./sharePopup";
import Link from "next/link";

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
      <div className="w-full mx-auto flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 px-5 pt-4 pb-2 sm:pb-4">
        <div>
          <p className="max-w-sm truncate text-lg">
            {adminAssessmentData.title}``
          </p>

          <p className="text-sm text-black/70">
            {calculateTotalMarks(
              adminAssessmentData.questions.map((question) => question.marks)
            )}{" "}
            {calculateTotalMarks(
              adminAssessmentData.questions.map((question) => question.marks)
            ) !== 1
              ? "marks"
              : "mark"}
          </p>
        </div>
        <div className="flex gap-3 items-center justify-end mt-2">
          <ExportAssessment
            fileName={adminAssessmentData.title}
            questions={adminAssessmentData.questions}
          />
          {adminAssessmentData.status === "public" && (
            <SharePopup nanoId={adminAssessmentData.nanoId} />
          )}
          {adminAssessmentData.status === "public" ? (
            <Link
              href={"/quizzes/" + adminAssessmentData.nanoId + "?share=true"}
            >
              <Button size={"lg"} className="gap-1 items-center">
                <IoShareOutline className="w-5 h-5" />
                Share
              </Button>
            </Link>
          ) : (
            adminAssessmentData.status === "private" && (
              <PublishingPopup
                id={adminAssessmentData.id}
                title={adminAssessmentData.title}
              />
            )
          )}
        </div>
      </div>
      <AssessmentTabs
        id={adminAssessmentData.id}
        title={adminAssessmentData.title}
        status={adminAssessmentData.status}
        duration={adminAssessmentData.duration}
        instructions={adminAssessmentData.instructions}
        credentials={adminAssessmentData.credentials}
        questions={adminAssessmentData.questions}
        submissions={adminAssessmentData.submissions}
        documentId={adminAssessmentData.documentId}
        numberOfChunks={adminAssessmentData.numberOfChunks}
        difficultyLevel={adminAssessmentData.difficultyLevel}
        requirements={adminAssessmentData.generationRequirements}
      />
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
