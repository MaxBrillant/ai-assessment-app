import { CreateServerClient } from "@/utils/supabase/serverClient";
import { notFound, redirect } from "next/navigation";
import AssessmentTabs from "./assessmentTabs";
import { calculateTotalMarks } from "@/utils/calculateTotalMarks";
import { Button } from "@/components/ui/button";
import ExportAssessment from "./exportAssessment";
import PublishingPopup from "./publishingPopup";
import SharePopup from "./sharePopup";
import Link from "next/link";
import { getAdminAssessmentData } from "@/app/api/assessments/fetch/getAdminAssessmentData";
import Image from "next/image";
import AccountDropdown from "@/app/components/accountDropdown";
import { FiShare } from "react-icons/fi";
import Footer from "@/app/footer";
import FeedbackDialog from "@/app/components/feedbackDialog";

export default async function Assessment({
  params,
}: {
  params: { quizId: string };
}) {
  const supabase = CreateServerClient();
  const authenticatedUser = await supabase.auth
    .getUser()
    .then((user) => user.data.user);

  if (!authenticatedUser) {
    redirect("/login?redirect=/dashboard/" + params.quizId);
  }

  const assessmentNanoId = params.quizId;
  const adminAssessmentData = await getAdminAssessmentData(
    assessmentNanoId
  ).catch(() => notFound());

  return (
    <div>
      <div className=" w-full mx-auto flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 px-5 py-2 bg-white">
        <div className="w-full flex items-center gap-4 justify-between">
          <Link href={"/dashboard"}>
            <Image
              src={"/logo-icon.svg"}
              width={40}
              height={40}
              className="w-10 h-10"
              alt="logo"
            />
          </Link>
          <div className="w-full flex flex-col">
            <p className="text-lg line-clamp-1">{adminAssessmentData.title}</p>
            <p className="text-sm text-black/70">
              {calculateTotalMarks(
                adminAssessmentData.questions.map((question) => question.marks)
              )}{" "}
              {calculateTotalMarks(
                adminAssessmentData.questions.map((question) => question.marks)
              ) !== 1
                ? "points"
                : "point"}
            </p>
          </div>
          <div className="block sm:hidden">
            <AccountDropdown user={authenticatedUser} />
          </div>
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
              href={"/dashboard/" + adminAssessmentData.nanoId + "?share=true"}
            >
              <Button size={"lg"} className="gap-1 items-center">
                <FiShare className="w-5 h-5" />
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

          <div className="hidden sm:block">
            <AccountDropdown user={authenticatedUser} />
          </div>
        </div>
      </div>
      <AssessmentTabs
        id={adminAssessmentData.id}
        title={adminAssessmentData.title}
        status={adminAssessmentData.status}
        duration={adminAssessmentData.duration}
        instructions={adminAssessmentData.instructions}
        credentials={adminAssessmentData.credentials}
        assessmentNanoId={adminAssessmentData.nanoId}
        questions={adminAssessmentData.questions}
        submissions={adminAssessmentData.submissions}
        documentId={adminAssessmentData.documentId}
        numberOfChunks={adminAssessmentData.numberOfChunks}
        difficultyLevel={adminAssessmentData.difficultyLevel}
        requirements={adminAssessmentData.generationRequirements}
      />

      <div className="fixed right-4 bottom-4 z-50">
        <FeedbackDialog />
      </div>
      <Footer />
    </div>
  );
}
