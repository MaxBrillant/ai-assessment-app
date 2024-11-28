"use server";

import { QuestionType } from "@/app/components/question";
import {
  queryVectorStore,
  queryVectorStoreFromChunkIndex,
} from "../../document/vectorStore";
import { getQuestionTypeAndMarks } from "./getQuestionTypesAndMarks";
import pickRandomChunks from "./pickRandomChunks";
import { generateQuestion } from "../question/generateQuestion";
import { reduceCredits } from "../../auth/createUserProfile";

export async function generateAssessmentQuestions(
  documentId: string,
  numberOfQuestions: number,
  totalMarks: number,
  difficultyLevel: number,
  requirements: string | undefined,
  chunksLength: number
) {
  try {
    console.log(
      `Starting to generate the assessment questions...(${numberOfQuestions} questions, ${totalMarks} marks, ${difficultyLevel}% difficulty, requirements: "${requirements}")`
    );

    const contextChunks: {
      content: string | undefined;
      chunkIndexes: number[] | undefined;
    }[] = [];

    if (requirements) {
      console.log("Getting prioritized chunks...");

      const prioritizedChunks = await queryVectorStore(
        documentId,
        requirements,
        numberOfQuestions
      );

      for (let i = 0; i < prioritizedChunks.length; i += 1) {
        contextChunks.push({
          content: prioritizedChunks[i].pageContent,
          chunkIndexes: [prioritizedChunks[i].metadata.chunkIndex],
        });
      }
    }

    if (numberOfQuestions > contextChunks.length) {
      console.log("Picking random chunks...");
      const randomlyPickedChunks = await pickRandomChunks(
        chunksLength,
        numberOfQuestions - contextChunks.length,
        difficultyLevel
      );

      await Promise.all(
        randomlyPickedChunks.map(async (chunk) => {
          const pageContent = await queryVectorStoreFromChunkIndex(
            documentId,
            chunk
          );

          contextChunks.push({
            content: pageContent.pageContent,
            chunkIndexes: [chunk],
          });
        })
      );
    }

    console.log(
      "Getting question type and marks for each question based on difficulty level..."
    );
    const questionTypeAndMarks = await getQuestionTypeAndMarks(
      numberOfQuestions,
      totalMarks,
      difficultyLevel
    );

    console.log("Generating questions and answers...");

    const questions: QuestionType[] = [];

    let i = 0;
    while (i < numberOfQuestions) {
      const questionRequests = contextChunks
        .slice(i, i + 20)
        .map(async (chunk, index) => {
          try {
            return await generateQuestion(
              questionTypeAndMarks[index].type,
              chunk.content ?? "",
              difficultyLevel,
              requirements ?? "",
              questionTypeAndMarks[index].marks,
              ""
            );
          } catch (e) {
            i += 1;
            console.error(
              `Error while generating question number ${
                i + 1
              }, the error is: ${e}`
            );
          }
        });

      const questionResponses = await Promise.all(questionRequests);

      questions.push(
        ...questionResponses.filter((response) => response !== undefined)
      );

      i += 20;
    }

    if (questions.length === 0) {
      throw new Error(
        "Error while generating the assessment questions: not enough questions could be generated"
      );
    }

    const creditsToReduce = questions.reduce((acc, cur) => {
      if (cur.type === "long-answer") {
        return acc + 2;
      }
      return acc + 1;
    }, 0);

    console.log("Reducing user credits (" + creditsToReduce + " credits)...");
    await reduceCredits(creditsToReduce);

    console.log("Successfully generated the assessment questions!");
    return questions;
  } catch (e) {
    throw new Error(`Error while generating the assessment questions: ${e}`);
  }
}
