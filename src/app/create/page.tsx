"use client";

import { useContext, useEffect, useState } from "react";
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
import {
  AssessmentContext,
  AssessmentProvider,
} from "../context/assessmentContext";

type GeneratedTestType = {
  title: string;
  questions: QuestionType[];
  documentId: string;
  numberOfChunks: number;
};
export default function Create() {
  const assessmentContext = useContext(AssessmentContext);
  const [uploadedDocument, setUploadedDocument] = useState<File | undefined>();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const urlSearchParams = useSearchParams();
  const { push } = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const generateAssessmentAndSaveToDB = async () => {
      const formData = new FormData();
      formData.append("file", assessmentContext.document as File);
      formData.append(
        "type",
        assessmentContext.document?.type === "application/pdf"
          ? "pdf"
          : assessmentContext.document?.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ? "docx"
          : "pptx"
      );
      formData.append("questions", String(assessmentContext.numberOfQuestions));
      formData.append("marks", String(assessmentContext.totalMarks));
      formData.append(
        "difficulty-level",
        String(assessmentContext.difficultyLevel)
      );
      if (assessmentContext.requirements) {
        formData.append(
          "requirements",
          assessmentContext.requirements as string
        );
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
            duration: assessmentContext.duration as
              | "15"
              | "30"
              | "45"
              | "60"
              | "90"
              | "120"
              | "150"
              | "180",
            instructions: assessmentContext.instructions,
            credentials: assessmentContext.credentials,
            difficultyLevel: assessmentContext.difficultyLevel,
            generationRequirements: assessmentContext.requirements,
          },
          assessmentObject.documentId,
          assessmentObject.numberOfChunks
        );

        if (newAssessmentNanoId) {
          toast({
            title: "Assessment created successfully",
          });
          assessmentContext.document = undefined;
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
        !assessmentContext.document ||
        !assessmentContext.numberOfQuestions ||
        assessmentContext.difficultyLevel == undefined
        // !authenticatedUser
      ) {
        push("/create");
      } else {
        if (isLoginOpen) {
          setIsLoginOpen(false);
          generateAssessmentAndSaveToDB();
        }
      }
    }
  }, [urlSearchParams]);

  return urlSearchParams.get("assessment") !== "true" ? (
    <AssessmentProvider>
      {uploadedDocument ? (
        <div className="max-w-md mx-auto p-5 flex flex-col gap-4 items-center justify-center">
          <div
            className={
              (uploadedDocument.type === "application/pdf"
                ? "bg-red-50"
                : uploadedDocument.type ===
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ? "bg-blue-50"
                : "bg-orange-50") +
              " relative flex flex-col gap-2 items-center mx-auto text-center w-fit max-w-full p-6 border border-black/30 rounded-xl"
            }
          >
            {uploadedDocument.type === "application/pdf" ? (
              <FaFilePdf className="w-16 h-16 fill-red-500" />
            ) : uploadedDocument.type ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
              <FaFileWord className="w-16 h-16 fill-blue-500" />
            ) : (
              <FaFilePowerpoint className="w-16 h-16 fill-orange-500" />
            )}
            <p className="text-sm max-w-full truncate">
              {uploadedDocument.name}
            </p>
            <button
              className="absolute bottom-[-0.7rem] mx-auto w-fit flex flex-row px-2 py-1 items-center text-center text-sm text-black/70 gap-1 bg-gray-100 border border-black/30 rounded-full"
              onClick={() => {
                setUploadedDocument(undefined);
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
            uploadedDocument={uploadedDocument}
            onSubmit={(data) => {
              assessmentContext.numberOfQuestions = data.numberOfQuestions;
              assessmentContext.totalMarks = data.totalMarks;
              assessmentContext.difficultyLevel = data.difficultyLevel;
              assessmentContext.requirements = data.requirements;
              setIsLoginOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="w-screen h-screen flex items-center justify-center">
          <div className="max-w-md flex flex-col gap-8 p-10">
            <h1 className="text-xl font-bold text-center">
              Create insightful and well-crafted assessment questions from any{" "}
              <span className="text-red-500 font-bold">PDF</span>,{" "}
              <span className="text-blue-500 font-bold">Word • Docs</span> or{" "}
              <span className="text-orange-500 font-bold">PowerPoint</span> file
            </h1>
            <p className="text-center -mt-4 text-black/70">
              Just bring your notes and let us handle the rest
            </p>
            <DropZone
              onFileUpload={(file) => {
                if ((file?.size as number) > 20000000) {
                  toast({
                    description:
                      "The file is too large, please choose a file smaller than 20MB",
                    title: "Error",
                    variant: "destructive",
                  });
                  return;
                } else {
                  setUploadedDocument(file);
                  assessmentContext.document = file;
                }
              }}
            />
            <Input
              id="doc"
              type="file"
              accept=".pdf,.docx,.pptx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if ((file?.size as number) > 20000000) {
                  toast({
                    description:
                      "The file is too large, please choose a file smaller than 20MB",
                    title: "Error",
                    variant: "destructive",
                  });
                  return;
                } else {
                  setUploadedDocument(file);
                  assessmentContext.document = file;
                  e.target.value = "";
                  e.target.files = null;
                }
              }}
            />
          </div>
        </div>
      )}

      {isLoginOpen && (
        <Dialog open onOpenChange={setIsLoginOpen}>
          <DialogContent>
            <LoginForm
              heading="One last thing before we can start generating questions"
              redirectUrl="/create?assessment=true"
            />
          </DialogContent>
        </Dialog>
      )}
    </AssessmentProvider>
  ) : (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white opacity-30">
      <RiLoader3Fill className="w-20 h-20 animate-spin" />
      <p className="text-lg font-medium">Generating questions...</p>
      {(assessmentContext.document?.size as number) > 10000000 && (
        <p className="text-sm">The bigger the file, the longer it will take</p>
      )}
    </div>
  );
}
