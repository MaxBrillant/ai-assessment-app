import getAssessmentData from "@/app/api/assessment/getAssessmentData";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import QuizForm from "./quizForm";
import CountdownTimer from "@/app/components/countDownTimer";
import QuizOverview from "./quizOverview";
import getSubmissionData from "@/app/api/assessment/getSubmissionData";
import Link from "next/link";

export default async function Page({
  params,
  searchParams,
}: {
  params: { quizId: string };
  searchParams: { submissionId: string | undefined };
}) {
  const quizNanoId = params.quizId;

  const quizData = await getAssessmentData(quizNanoId);

  const submissionData =
    quizData && searchParams.submissionId
      ? await getSubmissionData(quizData?.id, searchParams.submissionId)
      : undefined;

  if (!quizData) {
    return notFound();
  }

  return (
    <div>
      {!searchParams.submissionId && (
        <QuizOverview
          id={quizData.id}
          title={quizData.title}
          duration={quizData.duration}
          instructions={quizData.instructions}
          credentials={quizData.credentials}
        />
      )}
      <div className="flex flex-col p-4 border-b border-black">
        <p className="text-2xl font-semibold">{quizData.title}</p>
        <p>Total marks: 50 marks</p>
        <Button variant={"link"} className="w-fit underline">
          Read instructions
        </Button>
        {submissionData && (
          <CountdownTimer
            assessmentCreationTime={new Date(submissionData.created_at)}
            assessmentDuration={quizData.duration * 60}
            submissionStatus={submissionData.submissionStatus}
          />
        )}
      </div>
      {submissionData ? (
        <QuizForm
          id={submissionData.id}
          questions={quizData.questions}
          defaultValues={submissionData.answers}
        />
      ) : (
        <div>
          <p>Please begin the assessment to access the questions</p>
          <Link href={`/quiz/${quizNanoId}`}>
            <Button>Begin the assessment</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
