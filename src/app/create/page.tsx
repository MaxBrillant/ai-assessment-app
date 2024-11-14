"use client";

import { useContext, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import GenerationForm from "../forms/generationForm";
import LoginForm from "../login/loginForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FiEdit3 } from "react-icons/fi";
import DropZone from "./dropzone";
import { FaFilePdf, FaFilePowerpoint, FaFileWord } from "react-icons/fa6";
import { useToast } from "@/hooks/use-toast";
import {
  AssessmentContext,
  AssessmentProvider,
} from "../context/assessmentContext";
import "./paper.css";
import { Source_Serif_4 } from "next/font/google";
import getTenAssessmentsInfo from "../api/assessments/fetch/getTenAssessmentsInfo";
import Link from "next/link";
import { handleFileDataInsertionIntoVectorStore } from "../api/document/handleFileData";
import Loading from "../loading";

const sourceSerif = Source_Serif_4({ subsets: ["latin"] });

export default function Create() {
  const assessmentContext = useContext(AssessmentContext);
  const [uploadedDocument, setUploadedDocument] = useState<File | undefined>();
  const [assessmentsInfo, setAssessmentsInfo] = useState<
    {
      nanoId: string;
      title: string;
      duration: number;
      numberOfQuestions: number;
      difficultyLevel: number;
    }[]
  >();
  const [isUploading, setIsUploading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const getAssessmentInfo = async () => {
        try {
          const data = await getTenAssessmentsInfo();
          setAssessmentsInfo(data);
        } catch (err) {
          console.log("Error fetching assessments info");
        }
      };

      getAssessmentInfo();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
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
        <div className="flex flex-col items-center gap-10">
          <div className="w-full flex items-center justify-center pt-10">
            <div className="w-full max-w-md flex flex-col gap-8 p-10">
              <h1 className="text-xl font-bold text-center ">
                Create insightful and well-crafted assessment questions from any{" "}
                <span className="text-red-500 font-bold">PDF</span>,{" "}
                <span className="text-blue-500 font-bold">Word • Docs</span> or{" "}
                <span className="text-orange-500 font-bold">PowerPoint</span>{" "}
                file
              </h1>
              <p className="text-center -mt-4 text-black/70">
                Just bring your notes and let us handle the rest
              </p>
              <DropZone
                onFileUpload={async (file) => {
                  if ((file?.size as number) > 20000000) {
                    toast({
                      description:
                        "The file is too large, please choose a file smaller than 20MB",
                      title: "Error",
                      variant: "destructive",
                    });
                    return;
                  } else {
                    setIsUploading(true);
                    const formData = new FormData();
                    formData.append("file", file);

                    try {
                      const { documentId, title, chunksLength } =
                        await handleFileDataInsertionIntoVectorStore(
                          formData,
                          file.type === "application/pdf"
                            ? "pdf"
                            : file.type ===
                              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            ? "docx"
                            : "pptx"
                        );
                      assessmentContext.documentId = documentId;
                      assessmentContext.title = title;
                      assessmentContext.numberOfChunks = chunksLength;
                      setUploadedDocument(file);
                      setIsUploading(false);
                    } catch (err) {
                      toast({
                        title: "Error",
                        description:
                          "Something went wrong while uploading the file, check your file and try again",
                        variant: "destructive",
                      });
                      setIsUploading(false);
                    }
                  }
                }}
              />
              <Input
                id="doc"
                type="file"
                accept=".pdf,.docx,.pptx"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if ((file?.size as number) > 20000000) {
                    toast({
                      description:
                        "The file is too large, please choose a file smaller than 20MB",
                      title: "Error",
                      variant: "destructive",
                    });
                    return;
                  } else if (file) {
                    setIsUploading(true);
                    const formData = new FormData();
                    formData.append("file", file);

                    try {
                      const { documentId, title, chunksLength } =
                        await handleFileDataInsertionIntoVectorStore(
                          formData,
                          file.type === "application/pdf"
                            ? "pdf"
                            : file?.type ===
                              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            ? "docx"
                            : "pptx"
                        );
                      assessmentContext.documentId = documentId;
                      assessmentContext.title = title;
                      assessmentContext.numberOfChunks = chunksLength;
                      setUploadedDocument(file);
                      setIsUploading(false);
                    } catch (err) {
                      toast({
                        title: "Error",
                        description:
                          "Something went wrong while uploading the file, check your file and try again",
                        variant: "destructive",
                      });
                      setIsUploading(false);
                    }

                    e.target.value = "";
                    e.target.files = null;
                  }
                }}
              />
            </div>
          </div>
          {assessmentsInfo && assessmentsInfo.length > 0 && (
            <div className="w-full flex flex-col mb-20">
              <p className="text-2xl font-bold px-8 text-black/70">
                See what others have created
              </p>
              <div
                className="flex flex-row gap-16 p-12 py-8 w-full overflow-x-auto"
                style={{ scrollBehavior: "smooth", scrollbarWidth: "none" }}
              >
                {assessmentsInfo.map((assessment) => (
                  <Link
                    href={"/quiz/" + assessment.nanoId}
                    key={assessment.nanoId}
                  >
                    <div className="relative w-fit hover:scale-110 transition-all duration-300 cursor-pointer">
                      <section className="blokken"></section>
                      <p
                        className={
                          "absolute top-8 left-4 font-medium leading-8 text-black/70 " +
                          sourceSerif.className
                        }
                      >
                        <p className="text-lg text-wrap line-clamp-2 leading-8">
                          {assessment.title}
                        </p>
                        <p className="text-sm leading-8 font-normal text-black/50">
                          • {assessment.numberOfQuestions} question
                          {assessment.numberOfQuestions > 1 ? "s" : ""}
                        </p>
                        <p className="text-sm leading-8 font-normal text-black/50">
                          • {assessment.duration} minutes
                        </p>
                        <p className="text-sm leading-8 font-normal text-black/50">
                          •{" "}
                          {assessment.difficultyLevel <= 25
                            ? "Very easy"
                            : assessment.difficultyLevel <= 50
                            ? "Medium easy"
                            : assessment.difficultyLevel <= 75
                            ? "Medium hard"
                            : "Very Hard"}
                        </p>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {isUploading && <Loading message="Uploading your document..." />}
        </div>
      )}

      {isLoginOpen && (
        <Dialog open onOpenChange={setIsLoginOpen}>
          <DialogContent>
            <LoginForm
              heading="One last thing before we can start generating questions"
              redirectUrl="/create/quiz"
            />
          </DialogContent>
        </Dialog>
      )}
    </AssessmentProvider>
  );
}
