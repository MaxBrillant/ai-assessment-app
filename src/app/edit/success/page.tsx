"use client";

import { CreateAssessment } from "@/app/api/assessment/createAssessment";
import { AssessmentContext } from "@/app/context/assessmentContext";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function Success() {
  const assessmentContext = useContext(AssessmentContext);
  const [assessmentHasBeenSaved, setAssessmentHasBeenSaved] = useState(false);
  const { push } = useRouter();

  useEffect(() => {
    if (!assessmentContext.document) {
      push("/");
    }
  }, []);

  useEffect(() => {
    const createAssessment = async () => {
      const formData = new FormData();
      formData.append("title", assessmentContext.title);
      formData.append("context", assessmentContext.context);
      formData.append("questions", JSON.stringify(assessmentContext.questions));
      formData.append(
        "requirements",
        assessmentContext.requirements ? assessmentContext.requirements : ""
      );
      formData.append(
        "difficultyLevel",
        String(assessmentContext.difficultyLevel)
      );
      formData.append("duration", assessmentContext.duration);
      formData.append(
        "instructions",
        assessmentContext.instructions ? assessmentContext.instructions : ""
      );
      formData.append(
        "credentials",
        JSON.stringify(assessmentContext.credentials)
      );
      const response = await CreateAssessment(formData);
    };
    createAssessment()
  }, [assessmentContext]);

  return (
    <div>
      {assessmentHasBeenSaved ? (
        <p>Your assessment has been successfully created</p>
      ) : (
        <p>Creating your assessment</p>
      )}
    </div>
  );
}
