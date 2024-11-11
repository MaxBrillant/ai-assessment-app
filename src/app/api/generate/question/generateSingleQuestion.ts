"use server";

import pickRandomChunks from "../assessment/pickRandomChunks";
import {
  queryVectorStore,
  queryVectorStoreFromChunkIndex,
} from "../document/vectorStore";
import { generateQuestion } from "./generateQuestion";

export async function generateSingleQuestion(props: {
  documentId: string;
  type: "short-answer" | "multiple-choice" | "long-answer";
  marks: number;
  difficultyLevel: number;
  numberOfChunks: number;
  requirements: string;
}) {
  try {
    let context = "";

    const similarChunk = await queryVectorStore(
      props.documentId,
      props.requirements,
      1
    );
    if (similarChunk.length > 0) {
      context = similarChunk[0].pageContent;
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

    const question = await generateQuestion(
      props.type,
      context,
      props.difficultyLevel,
      props.requirements,
      props.marks
    );

    return question;
  } catch (e) {
    console.error("Error while generating single question: " + e);
  }
}
