"use client";

import { useContext, useState } from "react";
import { Input } from "@/components/ui/input";
import GenerationForm from "../forms/generationForm";
import { FiEdit3 } from "react-icons/fi";
import { FaFilePdf, FaFilePowerpoint, FaFileWord } from "react-icons/fa6";
import { useToast } from "@/hooks/use-toast";
import {
  AssessmentContext,
  AssessmentProvider,
} from "../context/assessmentContext";
import { Source_Serif_4 } from "next/font/google";
import Loading from "../loading";
import { useRouter } from "next/navigation";
import { CreateBrowserClient } from "@/utils/supabase/browserClient";
import DropZone from "./dropzone";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const sourceSerif = Source_Serif_4({ subsets: ["latin"] });

export default function FilePicker() {
  const assessmentContext = useContext(AssessmentContext);
  const [uploadedDocument, setUploadedDocument] = useState<File | undefined>();

  const [isUploading, setIsUploading] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const { push } = useRouter();
  const { toast } = useToast();

  return (
    <AssessmentProvider>
      {uploadedDocument ? (
        <Dialog open onOpenChange={(open) => setIsDiscarding(!open)}>
          <Dialog open={isDiscarding} onOpenChange={setIsDiscarding}>
            <DialogContent>
              <div className="mx-auto p-5 flex flex-col gap-4 items-center justify-center">
                <p>Are you sure you want to discard?</p>
                <div className="flex flex-row gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsDiscarding(false);
                      setUploadedDocument(undefined);
                    }}
                  >
                    Discard
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <DialogContent>
            <div className="w-full mx-auto p-5 flex flex-col gap-4 items-center justify-center">
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
                onSubmit={async (data) => {
                  assessmentContext.numberOfQuestions = data.numberOfQuestions;
                  assessmentContext.totalMarks = data.totalMarks;
                  assessmentContext.difficultyLevel = data.difficultyLevel;
                  assessmentContext.requirements = data.requirements;

                  const supabase = await CreateBrowserClient();
                  const user = (await supabase.auth.getUser()).data.user;
                  if (!user) {
                    push("/login?redirect=/create/quiz");
                  } else {
                    push("/create/quiz");
                  }
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="relative flex flex-col">
          <div className="w-full flex items-center justify-center">
            <div className="w-full max-w-lg flex flex-col gap-8">
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
                    formData.append(
                      "type",
                      file.type === "application/pdf"
                        ? "pdf"
                        : file.type ===
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        ? "docx"
                        : "pptx"
                    );

                    try {
                      const response = await fetch("/api/document", {
                        method: "POST",
                        body: formData,
                      });

                      const { documentId, title, chunksLength } =
                        await response.json();
                      assessmentContext.documentId = documentId as string;
                      assessmentContext.title = title as string;
                      assessmentContext.numberOfChunks = chunksLength as number;
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
              <p className="text-sm -mt-4">
                Supported file types: .pdf, .docx, .pptx
              </p>
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
                    formData.append(
                      "type",
                      file.type === "application/pdf"
                        ? "pdf"
                        : file.type ===
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        ? "docx"
                        : "pptx"
                    );

                    try {
                      const response = await fetch("/api/document", {
                        method: "POST",
                        body: formData,
                      });

                      const { documentId, title, chunksLength } =
                        await response.json();
                      assessmentContext.documentId = documentId as string;
                      assessmentContext.title = title as string;
                      assessmentContext.numberOfChunks = chunksLength as number;
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
          {isUploading && <Loading message="Uploading your document..." />}
        </div>
      )}
    </AssessmentProvider>
  );
}
