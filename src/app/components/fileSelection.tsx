"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FaFilePdf, FaFilePowerpoint, FaFileWord } from "react-icons/fa6";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import QuestionPanel from "./questionsPanel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import GenerationForm from "./generationForm";

export type TestType = {
  title: string;
  totalMarks: number;
  questions: Array<{
    type: "short-answer" | "long-answer" | "multiple-choice";
    content: string;
    choices?: string[];
    marks: number;
    answer: {
      content?: string;
      choices?: string[];
    };
  }>;
};
export default function FileSelection() {
  const [uploadedDocument, setUploadedDocument] = useState<File | undefined>();
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    TestType | undefined
  >();

  return (
    <div>
      <Input
        id="doc"
        type="file"
        accept=".pdf,.docx,.pptx"
        className="w-full h-20 rounded-2xl"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setUploadedDocument(file);
          e.target.value = "";
          e.target.files = null;
        }}
      />

      {uploadedDocument && (
        <Dialog open={true} onOpenChange={() => setUploadedDocument(undefined)}>
          <DialogContent className="max-h-[100vh] overflow-auto">
            <GenerationForm
              uploadedDocument={uploadedDocument}
              onSubmit={(data) => {
                setUploadedDocument(undefined);
                setQuestionsLoading(true);
                const formData = new FormData();
                formData.append("file", uploadedDocument);
                formData.append(
                  "type",
                  uploadedDocument.type === "application/pdf"
                    ? "pdf"
                    : uploadedDocument.type ===
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    ? "docx"
                    : "pptx"
                );
                formData.append("questions", data.numberOfQuestions.toString());
                formData.append("marks", data.totalMarks.toString());
                formData.append(
                  "difficulty-level",
                  data.difficultyLevel.toString()
                );
                formData.append("requirements", data.requirements as string);

                fetch("/api/generate/questions-and-answers", {
                  method: "POST",
                  body: formData,
                })
                  .then(async (res) => {
                    setQuestionsLoading(false);
                    const questions = await res.json();
                    const questionsObject: TestType = JSON.parse(questions);
                    setGeneratedQuestions(questionsObject);
                    setUploadedDocument(undefined);
                  })
                  .catch((err) => console.error(err));
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {(questionsLoading || generatedQuestions) && (
        <div className="absolute left-0 right-0 top-0 bottom-0 z-30 bg-white">
          {questionsLoading && (
            <div>
              <p>Questions and answers are loading...</p>
            </div>
          )}
          {generatedQuestions && (
            <div className="text-left">
              <Button onClick={() => setGeneratedQuestions(undefined)}>
                Go back to home
              </Button>
              <div className="flex flex-col gap-1 p-3">
                <p className="text-3xl font-semibold">
                  {generatedQuestions.title}
                </p>
                <p>{generatedQuestions.totalMarks} marks</p>
                <p>
                  {generatedQuestions?.questions.length} questions generated
                </p>
              </div>
              <QuestionPanel
                generatedQuestions={generatedQuestions.questions}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
