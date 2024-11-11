"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import GenerationForm from "../forms/generationForm";
import LoginForm from "../login/loginForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FiEdit3 } from "react-icons/fi";
import DropZone from "./dropzone";
import { FaFilePdf, FaFilePowerpoint, FaFileWord } from "react-icons/fa6";
import { QuestionType } from "../components/question";
import { useRouter, useSearchParams } from "next/navigation";
import { CreateBrowserClient } from "@/utils/supabase/browserClient";
import { useToast } from "@/hooks/use-toast";
import { createAssessment } from "../api/assessments/mutations";
import { RiLoader3Fill } from "react-icons/ri";

type assessmentType = {
  document: File | undefined;
  numberOfQuestions: number;
  totalMarks: number;
  numberOfChunks: number;
  requirements: string | undefined;
  title: string;
  questions: QuestionType[];
  duration: string;
  instructions: string | undefined;
  credentials: string[];
  difficultyLevel: number;
};

type GeneratedTestType = {
  title: string;
  questions: QuestionType[];
  documentId: string;
  numberOfChunks: number;
};
export default function Create() {
  const [assessmentData, setAssessmentData] = useState<assessmentType>({
    document: undefined,
    numberOfQuestions: 0,
    totalMarks: 0,
    numberOfChunks: 0,
    requirements: undefined,
    title: "",
    questions: [],
    duration: "60",
    instructions: undefined,
    credentials: ["Email address", "Full name"],
    difficultyLevel: 0,
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const urlSearchParams = useSearchParams();
  const { push } = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const generateAssessmentAndSaveToDB = async () => {
      const formData = new FormData();
      formData.append("file", assessmentData.document as File);
      formData.append(
        "type",
        assessmentData.document?.type === "application/pdf"
          ? "pdf"
          : assessmentData.document?.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ? "docx"
          : "pptx"
      );
      formData.append("questions", String(assessmentData.numberOfQuestions));
      formData.append("marks", String(assessmentData.totalMarks));
      formData.append(
        "difficulty-level",
        String(assessmentData.difficultyLevel)
      );
      if (assessmentData.requirements) {
        formData.append("requirements", assessmentData.requirements as string);
      }
      try {
        const data = await fetch("/api/generate/assessment", {
          method: "POST",
          body: formData,
        });
        const assessmentJson = await data.json();
        const assessmentObject: GeneratedTestType = assessmentJson;

        const newAssessmentNanoId = await createAssessment(
          {
            title: assessmentObject.title,
            questions: assessmentObject.questions,
            duration: assessmentData.duration as
              | "15"
              | "30"
              | "45"
              | "60"
              | "90"
              | "120"
              | "150"
              | "180",
            instructions: assessmentData.instructions,
            credentials: assessmentData.credentials,
            difficultyLevel: assessmentData.difficultyLevel,
            generationRequirements: assessmentData.requirements,
          },
          assessmentObject.documentId,
          assessmentObject.numberOfChunks
        );

        if (newAssessmentNanoId) {
          toast({
            title: "Assessment published successfully",
          });
          push(`/quizzes/${newAssessmentNanoId}`);
        } else {
          toast({
            description: "Something went wrong while creating the assessment",
            title: "Error",
            variant: "destructive",
          });
          setIsLoginOpen(false);
          push("/create");
        }
      } catch (err) {
        console.log(err);
        toast({
          description: "Something went wrong while generating the assessment",
          title: "Error",
          variant: "destructive",
        });
        setIsLoginOpen(false);
        push("/create");
      }
    };
    const param = urlSearchParams.get("assessment");

    if (param && param === "true") {
      if (
        !assessmentData.document ||
        !assessmentData.numberOfQuestions ||
        assessmentData.difficultyLevel == undefined
        // !authenticatedUser
      ) {
        push("/create");
      } else {
        generateAssessmentAndSaveToDB();
      }
    }
  }, [urlSearchParams]);

  return urlSearchParams.get("assessment") !== "true" ? (
    <div>
      {assessmentData.document ? (
        <div className="max-w-md mx-auto p-5 flex flex-col gap-4 items-center justify-center">
          <div
            className={
              (assessmentData.document.type === "application/pdf"
                ? "bg-red-50"
                : assessmentData.document.type ===
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ? "bg-blue-50"
                : "bg-orange-50") +
              " relative flex flex-col gap-2 items-center mx-auto text-center w-fit max-w-full p-6 border border-black/30 rounded-xl"
            }
          >
            {assessmentData.document.type === "application/pdf" ? (
              <FaFilePdf className="w-16 h-16 fill-red-500" />
            ) : assessmentData.document.type ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
              <FaFileWord className="w-16 h-16 fill-blue-500" />
            ) : (
              <FaFilePowerpoint className="w-16 h-16 fill-orange-500" />
            )}
            <p className="text-sm max-w-full truncate">
              {assessmentData.document.name}
            </p>
            <button
              className="absolute bottom-[-0.7rem] mx-auto w-fit flex flex-row px-2 py-1 items-center text-center text-sm text-black/70 gap-1 bg-gray-100 border border-black/30 rounded-full"
              onClick={() => {
                setAssessmentData({
                  ...assessmentData,
                  document: undefined,
                });
                setTimeout(() => {
                  document.getElementById("doc")?.click();
                }, 100);
              }}
            >
              <FiEdit3 />
              Change
            </button>
          </div>

          <GenerationForm
            uploadedDocument={assessmentData.document}
            onSubmit={(data) => {
              setAssessmentData({
                ...assessmentData,
                numberOfQuestions: data.numberOfQuestions,
                totalMarks: data.totalMarks,
                difficultyLevel: data.difficultyLevel,
                requirements: data.requirements,
              });
              setIsLoginOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="w-screen h-screen flex items-center justify-center">
          <div className="max-w-md flex flex-col gap-8 p-4">
            <h1 className="text-xl font-medium text-center">
              Create insightful and well-crafted questions for your next
              assessment from any{" "}
              <span className="text-red-500 font-bold">PDF</span>,{" "}
              <span className="text-blue-500 font-bold">Word • Docs</span> or{" "}
              <span className="text-orange-500 font-bold">PowerPoint</span> file
            </h1>
            <DropZone
              onFileUpload={(file) => {
                setAssessmentData({
                  ...assessmentData,
                  document: file,
                });
              }}
            />
            <Input
              id="doc"
              type="file"
              accept=".pdf,.docx,.pptx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setAssessmentData({
                  ...assessmentData,
                  document: file,
                });
                e.target.value = "";
                e.target.files = null;
              }}
            />
          </div>
        </div>
      )}

      {isLoginOpen && (
        <Dialog open onOpenChange={setIsLoginOpen}>
          <DialogContent>
            <LoginForm
              heading="One last thing before we can create your assessment"
              redirectUrl="/create?assessment=true"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  ) : (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white opacity-30">
      <RiLoader3Fill className="w-20 h-20 animate-spin" />
      <p className="text-lg font-medium">Cooking...</p>
    </div>
  );
}
