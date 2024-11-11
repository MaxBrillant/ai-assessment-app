import { NextRequest, NextResponse } from "next/server";
import { handleFileDataInsertionIntoVectorStore } from "../document/handleFileData";
import { nanoid } from "nanoid";
import pickRandomChunks from "./pickRandomChunks";
import {
  queryVectorStore,
  queryVectorStoreFromChunkIndex,
} from "../document/vectorStore";
import { QuestionType } from "@/app/components/question";
import { generateQuestion } from "../question/generateQuestion";
import { getQuestionTypeAndMarks } from "./getQuestionTypesAndMarks";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.getAll("file")[0] as Blob;
    const type = formData.getAll("type")[0] as "pdf" | "docx" | "pptx";
    const numberOfQuestions = Number(formData.getAll("questions")[0]);
    const marks = Number(formData.getAll("marks")[0]);
    const difficultyLevel = Number(formData.getAll("difficulty-level")[0]);
    const requirements = formData.getAll("requirements")[0] as
      | string
      | undefined;

    const startingFrom = formData.getAll("startingFrom")[0]
      ? Number(formData.getAll("startingFrom")[0])
      : undefined;
    const endingAt = formData.getAll("endingAt")[0]
      ? Number(formData.getAll("endingAt")[0])
      : undefined;

    const documentId = nanoid();

    console.log(
      `Starting to generate the assessment...(${numberOfQuestions} questions, ${marks} marks, ${difficultyLevel}% difficulty, from Page ${startingFrom} to Page ${endingAt}, requirements: "${requirements}")`
    );

    console.log("Inserting file data into vector store...");
    const { title, chunksLength } =
      await handleFileDataInsertionIntoVectorStore(
        documentId,
        file,
        type,
        startingFrom,
        endingAt
      );

    console.log(
      `File data inserted into vector store. Assessment title: "${title}"`
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
    const questionTypeAndMarks = getQuestionTypeAndMarks(
      numberOfQuestions,
      marks,
      difficultyLevel
    );

    console.log("Generating questions and answers...");

    const questions: QuestionType[] = [];

    let i = 0;
    while (i < numberOfQuestions) {
      const questionRequests = contextChunks
        .slice(i, i + 10)
        .map(async (chunk) => {
          return await generateQuestion(
            questionTypeAndMarks[i].type,
            chunk.content ?? "",
            difficultyLevel,
            requirements ?? "",
            questionTypeAndMarks[i].marks
          );
        });

      const questionResponses = await Promise.all(questionRequests);

      questions.push(...questionResponses);

      i += 10;
    }
    console.log("Successfully generated the assessment");

    return new NextResponse(
      JSON.stringify({
        title: title,
        questions: questions.map((question) => ({
          ...question,
          id: crypto.randomUUID(),
        })),
        documentId: documentId,
        numberOfChunks: chunksLength,
      })
    );
  } catch (e) {
    throw new Error(
      `Error while generating the assessment, the error is: ${e}`
    );
  }
}
