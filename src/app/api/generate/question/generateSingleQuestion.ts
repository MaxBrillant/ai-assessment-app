"use server";

import pickRandomChunks from "../assessment/pickRandomChunks";
import {
  queryVectorStore,
  queryVectorStoreFromChunkIndex,
} from "../../document/vectorStore";
import { generateQuestion } from "./generateQuestion";
import { reduceCredits } from "../../auth/createUserProfile";

export async function generateSingleQuestion(props: {
  documentId: string;
  type: "short-answer" | "multiple-choice" | "long-answer";
  marks: number;
  difficultyLevel: number;
  numberOfChunks: number;
  requirements: string;
  previousQuestion: string;
}) {
  try {
    let context = "";

    const similarToRequirementChunk = await queryVectorStore(
      props.documentId,
      props.requirements,
      1
    );
    if (similarToRequirementChunk.length > 0) {
      context = similarToRequirementChunk[0].pageContent;
    } else {
      const similarToPreviousQuestionChunk = await queryVectorStore(
        props.documentId,
        props.previousQuestion,
        1
      );

      if (similarToPreviousQuestionChunk.length > 0) {
        context = similarToPreviousQuestionChunk[0].pageContent;
      } else {
        const randomChunkId = await pickRandomChunks(
          props.numberOfChunks,
          1,
          props.difficultyLevel
        );

        const randomChunk = await queryVectorStoreFromChunkIndex(
          props.documentId,
          randomChunkId[0]
        );
        context = randomChunk.pageContent;
      }
    }

    const question = await generateQuestion(
      props.type,
      context,
      props.difficultyLevel,
      props.requirements,
      props.marks,
      props.previousQuestion
    );

    console.log("Reducing user credits...");

    await reduceCredits(props.type === "long-answer" ? 2 : 1);

    return question;
  } catch (e) {
    throw new Error("Error while generating single question: " + e);
  }
}
