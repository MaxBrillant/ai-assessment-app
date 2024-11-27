"use server";

import { QuestionType } from "@/app/components/question";
import { answersType } from "@/app/validation/submissionValidation";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import { gradeAnswer } from "./gradeAnswer";
import { reduceCredits } from "../../auth/createUserProfile";

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

    let numberOfGradedAnswers = 0;
    const chunkSize = 10;
    for (let i = 0; i < Math.ceil(answers.length / chunkSize); i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, answers.length);
      const currentAnswers = answers.slice(start, end);

      const promises = currentAnswers.map(async (answer, index) => {
        const question = questions.find(
          (q) => q.id === answer.questionId && answer.marks == undefined
        );

        if (question) {
          try {
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

            numberOfGradedAnswers++;

            return {
              ...answer,
              marks: grade.marks,
              comment: grade.comment,
            };
          } catch (err) {
            console.log("Error while grading answer: " + err);
            return answer;
          }
        } else {
          return answer;
        }
      });

      const newAnswers = await Promise.all(promises);

      answers.splice(start, end - start, ...newAnswers);
    }

    console.log(
      "Reducing user credits used (" + numberOfGradedAnswers + ")..."
    );

    await reduceCredits(numberOfGradedAnswers);

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
  } catch (err) {
    throw new Error("Error while grading the submission: " + err);
  }
}
