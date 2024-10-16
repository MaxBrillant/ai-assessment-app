"use server";

import { QuestionType } from "@/app/components/question";
import { answersType } from "@/app/validation/submissionValidation";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import { gradeAnswer } from "./gradeAnswer";

export async function gradeSubmission(
  submissionNanoId: string,
  questions: QuestionType[],
  answers: answersType
) {
  const supabase = CreateServerClient();

  console.log(
    "Grading all submissions of submission of nano ID " +
      submissionNanoId +
      "..."
  );

  await Promise.all(
    answers.map(async (answer, index) => {
      const question = questions.find(
        (question) => question.id === answer.questionId
      );

      if (question) {
        const grade = await gradeAnswer(
          question.content,
          question.type === "multiple-choice"
            ? question.answer.choices?.join(",") ?? ""
            : question.answer.content ?? "",
          question.type === "multiple-choice"
            ? answer.choices?.join(",") ?? ""
            : answer.content ?? "",
          question.marks
        );

        if (grade) {
          answers[index].marks = grade.receivedMarks;
          answers[index].comment = grade.comment;
        } else {
          console.error(
            "Something went wrong while grading answer number " + (index + 1)
          );
        }
      }
    })
  );

  console.log("Updating the submission...");

  const { data, error } = await supabase
    .from("submissions")
    .update({ answers: JSON.stringify(answers), status: "graded" })
    .eq("nano_id", submissionNanoId)
    .select("nano_id")
    .returns<{ nano_id: string }[]>();

  if (error || data.length === 0) {
    console.error("Error while grading the submission: " + error?.message);
    return undefined;
  }

  console.log("Submission graded successfully!");

  return data[0].nano_id;
}
