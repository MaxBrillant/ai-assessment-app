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
  try {
    const supabase = CreateServerClient();

    console.log(
      "Grading all submissions of submission of nano ID " +
        submissionNanoId +
        "..."
    );

    for (let index = 0; index < answers.length; index++) {
      const answer = answers[index];
      const question = questions.find(
        (q) => q.id === answer.questionId && answer.marks == undefined
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

        answers[index].marks = grade.marks;
        answers[index].comment = grade.comment;
      }
    }

    console.log("Updating the submission...");

    const { data, error } = await supabase
      .from("submissions")
      .update({ answers: JSON.stringify(answers), status: "graded" })
      .eq("nano_id", submissionNanoId)
      .select("nano_id")
      .returns<{ nano_id: string }[]>();

    if (error || data.length === 0) {
      throw new Error(
        "Error while grading the submission: " + error
          ? error?.message
          : "No data returned"
      );
    }

    console.log("Submission graded successfully!");

    return data[0].nano_id;
  } catch (err) {
    throw new Error("Error while grading the submission: " + err);
  }
}
