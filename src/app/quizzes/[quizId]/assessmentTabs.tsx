"use client";
import { QuestionType } from "@/app/components/question";
import QuestionPanel from "@/app/components/questionsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import SubmissionView from "./submissionView";
import {
  updateAssessmentQuestions,
  updateAssessmentRules,
} from "@/app/api/assessments/mutations";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import RulesForm from "@/app/forms/rulesForm";

export default function AssessmentTabs(props: {
  id: number;
  title: string;
  duration: number;
  instructions: string | undefined;
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

  const [setHasUpdatedQuestions] = useState(false);

  const { refresh } = useRouter();
  const { toast } = useToast();

  return (
    <Tabs defaultValue="questions" className="w-full h-full">
      <TabsList className="w-full bg-white">
        <TabsTrigger value="questions">
          Questions ({props.questions.length})
        </TabsTrigger>
        <TabsTrigger value="submissions">
          Submissions ({props.submissions.length})
        </TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="questions" className="m-0">
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

            if (updateQuestions) {
              refresh();
            } else {
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
        <div className="grid grid-cols-2">
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
      <TabsContent value="settings" className="m-0">
        <RulesForm
          defaultValues={{
            title: props.title,
            duration: String(props.duration) as any,
            instructions: props.instructions,
            credentials: props.credentials,
          }}
          mode="update"
          onSubmit={async (data) => {
            const updateRules = await updateAssessmentRules(
              props.id,
              data.title,
              data.duration,
              data.instructions
            );

            if (updateRules) {
              toast({
                title: "Assessment details updated successfully",
              });
              refresh();
            } else {
              toast({
                description:
                  "Something went wrong while updating the assessment details",
                title: "Error",
                variant: "destructive",
              });
            }
          }}
        />
      </TabsContent>
    </Tabs>
  );
}
