import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import AssessmentForm from "./assessmentForm";
import CountdownTimer from "@/app/components/countDownTimer";
import AssessmentOverview from "./assessmentOverview";
import Link from "next/link";
import StartResubmissionDialog from "./startResubmissionDialog";
import InstructionsDialog from "./instructionsDialog";
import getAssessmentData from "@/app/api/assessments/fetch/getAssessmentData";
import getSubmissionData from "@/app/api/submissions/fetch/getSubmissionData";
import { RxDotFilled } from "react-icons/rx";
import { calculateTotalMarks } from "@/utils/calculateTotalMarks";

export default async function Page({
  params,
  searchParams,
}: {
  params: { quizId: string };
  searchParams: { submissionId: string | undefined };
}) {
  const assessmentNanoId = params.quizId;

  const assessmentData = await getAssessmentData(assessmentNanoId);

  const submissionData =
    assessmentData && searchParams.submissionId
      ? await getSubmissionData(assessmentData?.id, searchParams.submissionId)
      : undefined;

  if (!assessmentData) {
    return notFound();
  }

  return (
    <div>
      {!searchParams.submissionId && (
        <AssessmentOverview
          id={assessmentData.id}
          creatorEmail={assessmentData.userEmail}
          title={assessmentData.title}
          duration={assessmentData.duration}
          instructions={assessmentData.instructions}
          credentials={assessmentData.credentials}
        />
      )}
      <div className="max-w-xl mx-auto flex flex-col px-4 pt-4">
        <div>
          <p className="text-lg font-medium">{assessmentData.title}</p>
          <div className="flex gap-1 items-center">
            <p className="text-sm">
              {calculateTotalMarks(
                assessmentData.questions.map((question) => question.marks)
              )}{" "}
              {calculateTotalMarks(
                assessmentData.questions.map((question) => question.marks)
              ) !== 1
                ? "marks"
                : "mark"}
            </p>
            <RxDotFilled className="w-3 h-3 text-black/30" />
            {assessmentData.instructions ? (
              <InstructionsDialog instructions={assessmentData.instructions} />
            ) : (
              <p className="text-sm">No instructions provided</p>
            )}
          </div>
        </div>
        {submissionData && submissionData.submissionStatus !== "submitted" && (
          <CountdownTimer
            id={submissionData.id}
            assessmentCreationTime={
              submissionData.submissionStatus === "resubmission-allowed" &&
              submissionData.resubmissionStartedAt
                ? new Date(submissionData.resubmissionStartedAt)
                : new Date(submissionData.created_at)
            }
            assessmentDuration={assessmentData.duration * 60}
            submissionStatus={submissionData.submissionStatus}
          />
        )}
      </div>

      {submissionData &&
        submissionData.submissionTime &&
        submissionData.submissionStatus === "submitted" &&
        assessmentData.modifiedAt > submissionData.submissionTime && (
          <StartResubmissionDialog id={submissionData.id} />
        )}

      {submissionData &&
        (submissionData.submissionStatus === "resubmission-allowed" ? (
          <AssessmentForm
            id={submissionData.id}
            questions={assessmentData.questions.filter(
              (question) =>
                !submissionData.answers.some(
                  (answer) => answer.questionId === question.id
                )
            )}
            defaultValues={submissionData.answers}
            submissionStatus={submissionData.submissionStatus}
          />
        ) : (
          <AssessmentForm
            id={submissionData.id}
            questions={assessmentData.questions}
            defaultValues={submissionData.answers}
            submissionStatus={submissionData.submissionStatus}
          />
        ))}
    </div>
  );
}
