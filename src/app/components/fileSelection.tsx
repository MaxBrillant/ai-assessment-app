"use client";
import { useContext, useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import GenerationForm from "../forms/generationForm";
import {
  AssessmentContext,
  AssessmentProvider,
} from "../context/assessmentContext";
import { useRouter } from "next/navigation";

export default function FileSelection() {
  const [uploadedDocument, setUploadedDocument] = useState<File | undefined>();
  const { push } = useRouter();
  const assessmentContext = useContext(AssessmentContext);

  return (
    <AssessmentProvider>
      <div>
        <Input
          id="doc"
          type="file"
          accept=".pdf,.docx,.pptx"
          className="w-full h-20 rounded-2xl"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setUploadedDocument(file);
            assessmentContext.document = file;
            e.target.value = "";
            e.target.files = null;
          }}
        />

        {uploadedDocument && (
          <Dialog
            open={true}
            onOpenChange={() => setUploadedDocument(undefined)}
          >
            <DialogContent className="max-h-[100vh] overflow-auto">
              <GenerationForm
                uploadedDocument={uploadedDocument}
                onSubmit={(data) => {
                  setUploadedDocument(undefined);
                  assessmentContext.numberOfQuestions = data.numberOfQuestions;
                  assessmentContext.totalMarks = data.totalMarks;
                  assessmentContext.difficultyLevel = data.difficultyLevel;
                  assessmentContext.startingFrom = data.startingFrom;
                  assessmentContext.endingAt = data.endingAt;
                  assessmentContext.requirements = data.requirements;
                  push(`/edit`);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AssessmentProvider>
  );
}
