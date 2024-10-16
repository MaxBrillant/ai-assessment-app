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

export default async function Page({
  params,
  searchParams,
}: {
  params: { assessmentId: string };
  searchParams: { submissionId: string | undefined };
}) {
  const assessmentNanoId = params.assessmentId;

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
          creatorEmail={"Tuzobimenya hanyuma"}
          title={assessmentData.title}
          duration={assessmentData.duration}
          instructions={assessmentData.instructions}
          credentials={assessmentData.credentials}
        />
      )}
      <div className="flex flex-col p-4 border-b border-black">
        <p className="text-2xl font-semibold">{assessmentData.title}</p>
        <p>Total marks: 50 marks</p>
        {assessmentData.instructions ? (
          <InstructionsDialog instructions={assessmentData.instructions} />
        ) : (
          <p>No instructions provided</p>
        )}
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

      {submissionData ? (
        submissionData.submissionStatus === "resubmission-allowed" ? (
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
        )
      ) : (
        <div>
          <p>Please begin the assessment to access the questions</p>
          <Link href={`/quiz/${assessmentNanoId}`}>
            <Button>Begin the assessment</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
