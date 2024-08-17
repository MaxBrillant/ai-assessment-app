import { NextRequest, NextResponse } from "next/server";
import { ProcessFile } from "../processFile";
import { GenerateQuestions } from "../generateQuestions";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.getAll("file")[0] as Blob;
    const type = formData.getAll("type")[0] as "pdf" | "docx" | "pptx";
    const numberOfQuestions = Number(formData.getAll("questions")[0]);
    const marks = Number(formData.getAll("marks")[0]);
    const difficultyLevel = Number(formData.getAll("difficulty-level")[0]);
    const requirements = formData.getAll("requirements")[0] as string;

    console.log(
      `Starting to generate questions and answers...(${numberOfQuestions} questions, ${marks} marks, ${difficultyLevel}% difficulty, requirements: "${requirements}")`
    );

    console.log("Processing file...");
    const pages = await ProcessFile(file, type);
    console.log("File processed");

    console.log("Picking context pages...");

    const randomPages = getRandomPages(pages, numberOfQuestions);

    console.log(
      `Generating questions and answers from pages: ${randomPages.pages.join(
        ", "
      )} ...`
    );
    const questions = await GenerateQuestions(
      numberOfQuestions,
      randomPages.content,
      marks,
      difficultyLevel,
      requirements
    );

    console.log(questions);

    if (questions !== "") {
      JSON.parse(
        JSON.stringify(
          questions
            .replaceAll("\n", "")
            .replaceAll("\r", "")
            .replaceAll("\t", "")
        )
      );
      console.log("Questions and answers generated");

      return new NextResponse(
        JSON.stringify(
          questions
            .replaceAll("\n", "")
            .replaceAll("\r", "")
            .replaceAll("\t", "")
        )
      );
    } else {
      throw new Error(
        "Error while generating questions and answers. Please change your requirements and try again"
      );
    }
  } catch (e) {
    throw new Error(
      `Error while generating questions and answers, the error is: ${e}`
    );
  }
}

const getRandomPages = (pages: string[], numberOfQuestions: number) => {
  let pageNumbers: number[] = [];
  let pageContent: string[] = [];

  for (let i = 0; i < numberOfQuestions; i++) {
    const randomPageIndex = Math.floor(Math.random() * (pages.length - 1));
    pageNumbers.push(randomPageIndex);
    pageNumbers.push(randomPageIndex + 1);
    pageContent.push(`PAGE NUMBER ${randomPageIndex}: 
    
    ${pages[randomPageIndex]}`);
    pageContent.push(`PAGE NUMBER ${randomPageIndex + 1}: 
    
    ${pages[randomPageIndex + 1]}`);
  }

  return {
    pages: pageNumbers,
    content: pageContent,
  };
};
