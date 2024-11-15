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
import { getTimeAgo } from "@/utils/formatDates";
import { IoMdClose } from "react-icons/io";

export default function AssessmentTabs(props: {
  id: number;
  title: string;
  status: "public" | "private" | "closed";
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
  documentId: string;
  numberOfChunks: number;
  difficultyLevel: number;
  requirements: string | undefined;
}) {
  const [selectedSubmission, setSelectedSubmission] = useState<
    string | undefined
  >(undefined);

  const { refresh } = useRouter();
  const { toast } = useToast();

  return (
    <Tabs defaultValue="questions" className="w-full h-full">
      {props.status !== "private" && (
        <TabsList className="w-full bg-white">
          <TabsTrigger value="questions">
            Questions ({props.questions.length})
          </TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions ({props.submissions.length})
          </TabsTrigger>

          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      )}
      <TabsContent value="questions" className="m-0">
        <QuestionPanel
          defaultQuestions={props.questions}
          documentId={props.documentId}
          numberOfChunks={props.numberOfChunks}
          difficultyLevel={props.difficultyLevel}
          requirements={props.requirements}
          onChange={async (data) => {
            try {
              await updateAssessmentQuestions(props.id, data);
              toast({
                title: "Changes saved successfully",
              });
              refresh();
            } catch (err) {
              toast({
                description: "Something went wrong while saving your changes",
                title: "Error",
                variant: "destructive",
              });
            }
          }}
        />
      </TabsContent>
      {props.status !== "private" && (
        <TabsContent value="submissions">
          <div
            className={` ${
              selectedSubmission
                ? "grid grid-cols-1 sm:flex sm:flex-row sm:divide-x"
                : "grid grid-cols-1"
            }`}
          >
            <div
              className={`w-full sm:max-w-sm flex flex-col mx-auto max-h-[90vh] overflow-y-auto ${
                selectedSubmission &&
                "hidden sm:min-w-[20vw] sm:flex sm:flex-col"
              }`}
            >
              {props.submissions.filter(
                (submission) => submission.submissionStatus === "submitted"
              ).length > 0 && (
                <div className="my-1 p-3">
                  <p className="font-bold text-sm text-black/70 mb-2">
                    Ungraded submissions
                  </p>

                  <div className="flex flex-col divide-y">
                    {props.submissions
                      .filter(
                        (submission) =>
                          submission.submissionStatus === "submitted"
                      )
                      .map((submission) => {
                        return (
                          <button
                            key={submission.nanoId}
                            onClick={() => {
                              setSelectedSubmission(undefined);
                              setTimeout(() => {
                                setSelectedSubmission(submission.nanoId);
                              }, 10);
                            }}
                            className={`${
                              selectedSubmission === submission.nanoId &&
                              "border-2 border-black/50 bg-black/5"
                            } flex flex-col items-start gap-1 p-2 hover:bg-black/5 rounded-md`}
                          >
                            {props.credentials.length > 0 ? (
                              <p className="max-w-full truncate">
                                {submission.credentials[0]}
                              </p>
                            ) : (
                              <p>Anonymous</p>
                            )}
                            {submission.submissionTime && (
                              <p className="text-xs font-light max-w-full truncate">
                                Submitted{" "}
                                {getTimeAgo(
                                  new Date(submission.submissionTime)
                                )}
                              </p>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {props.submissions.filter(
                (submission) => submission.submissionStatus === "graded"
              ).length > 0 && (
                <div className="my-1 p-3">
                  <p className="font-bold text-sm text-black/70 mb-2">
                    Graded submissions
                  </p>

                  <div className="flex flex-col divide-y">
                    {props.submissions
                      .filter(
                        (submission) => submission.submissionStatus === "graded"
                      )
                      .map((submission) => {
                        return (
                          <button
                            key={submission.nanoId}
                            onClick={() => {
                              setSelectedSubmission(undefined);
                              setTimeout(() => {
                                setSelectedSubmission(submission.nanoId);
                              }, 10);
                            }}
                            className={`${
                              selectedSubmission === submission.nanoId &&
                              "border-2 border-black/50 bg-black/5"
                            } flex flex-col items-start gap-1 p-2 hover:bg-black/5 rounded-md`}
                          >
                            {props.credentials.length > 0 ? (
                              <p className="max-w-full truncate">
                                {submission.credentials[0]}
                              </p>
                            ) : (
                              <p>Anonymous</p>
                            )}
                            {submission.submissionTime && (
                              <p className="text-xs font-light max-w-full truncate">
                                Submitted{" "}
                                {getTimeAgo(
                                  new Date(submission.submissionTime)
                                )}
                              </p>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
            {selectedSubmission && (
              <div className="relative flex-grow overflow-y-auto">
                <button
                  className="absolute sm:hidden z-10 top-4 right-4 rounded-full p-2 bg-black/10"
                  onClick={() => setSelectedSubmission(undefined)}
                >
                  <IoMdClose className="w-5 h-5" />
                </button>
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
      )}
      {props.status !== "private" && (
        <TabsContent
          value="settings"
          className="m-0 flex items-center justify-center"
        >
          <RulesForm
            defaultValues={{
              title: props.title,
              duration: String(props.duration) as any,
              instructions: props.instructions,
              credentials: props.credentials,
            }}
            mode="update"
            onSubmit={async (data) => {
              try {
                await updateAssessmentRules(
                  props.id,
                  data.title,
                  data.duration,
                  data.instructions
                );

                toast({
                  title: "Assessment details updated successfully",
                });
                refresh();
              } catch (err) {
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
      )}
    </Tabs>
  );
}
