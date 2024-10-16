"use client";
import { QuestionType } from "@/app/components/question";
import QuestionPanel from "@/app/components/questionsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import SubmissionView from "./submissionView";
import { updateAssessmentQuestions } from "@/app/api/assessments/mutations";
import { useToast } from "@/hooks/use-toast";

export default function AssessmentTabs(props: {
  id: number;
  questions: QuestionType[];
  credentials: string[];
  submissions: {
    nanoId: string;
    credentials: string[];
    submissionTime: Date | undefined;
    submissionStatus: "submitted" | "graded";
  }[];
  context: string;
  difficultyLevel: number;
  requirements: string | undefined;
}) {
  const [selectedSubmission, setSelectedSubmission] = useState<
    string | undefined
  >(undefined);
  const { toast } = useToast();

  return (
    <Tabs defaultValue="questions" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="questions">
          Questions ({props.questions.length})
        </TabsTrigger>
        <TabsTrigger value="submissions">
          Submissions ({props.submissions.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="questions">
        <QuestionPanel
          defaultQuestions={props.questions}
          context={props.context}
          difficultyLevel={props.difficultyLevel}
          requirements={props.requirements}
          onChange={async (data) => {
            const updateQuestions = await updateAssessmentQuestions(
              props.id,
              data
            );

            if (!updateQuestions) {
              toast({
                description:
                  "Something went wrong while updating the assessment questions",
                title: "Error",
                variant: "destructive",
              });
            }
          }}
        />
      </TabsContent>
      <TabsContent value="submissions">
        <div className="grid grid-cols-2 bg-green">
          <div>
            {props.submissions.filter(
              (submission) => submission.submissionStatus === "submitted"
            ).length > 0 && (
              <div>
                <p>Non graded</p>

                {props.submissions
                  .filter(
                    (submission) => submission.submissionStatus === "submitted"
                  )
                  .map((submission) => {
                    return (
                      <button
                        key={submission.nanoId}
                        onClick={() => setSelectedSubmission(submission.nanoId)}
                      >
                        {props.credentials.length > 0 ? (
                          <p>
                            {props.credentials[0] +
                              ": " +
                              submission.credentials[0]}
                          </p>
                        ) : (
                          <p>Anonymous</p>
                        )}
                        <p>{submission.submissionTime?.toLocaleString()}</p>
                      </button>
                    );
                  })}
              </div>
            )}

            {props.submissions.filter(
              (submission) => submission.submissionStatus === "graded"
            ).length > 0 && (
              <div>
                <p>Graded</p>

                {props.submissions
                  .filter(
                    (submission) => submission.submissionStatus === "graded"
                  )
                  .map((submission) => {
                    return (
                      <button
                        key={submission.nanoId}
                        onClick={() => setSelectedSubmission(submission.nanoId)}
                      >
                        {props.credentials.length > 0 ? (
                          <p>
                            {props.credentials[0] +
                              ": " +
                              submission.credentials[0]}
                          </p>
                        ) : (
                          <p>Anonymous</p>
                        )}
                        <p>{submission.submissionTime?.toLocaleString()}</p>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
          {selectedSubmission && (
            <div>
              <SubmissionView
                assessmentId={props.id}
                submissionNanoId={selectedSubmission}
                credentialLabels={props.credentials}
                credentials={
                  props.submissions.find(
                    (submission) => submission.nanoId === selectedSubmission
                  )?.credentials || []
                }
                questions={props.questions}
                submissionStatus={
                  props.submissions.find(
                    (submission) => submission.nanoId === selectedSubmission
                  )?.submissionStatus as "submitted" | "graded"
                }
              />
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
