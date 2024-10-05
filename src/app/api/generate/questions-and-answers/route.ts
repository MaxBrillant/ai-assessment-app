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
    const startingFrom: number | undefined = Number(
      formData.getAll("startingFrom")[0]
    );
    const endingAt: number | undefined = Number(formData.getAll("endingAt")[0]);

    console.log(
      `Starting to generate the assessment...(${numberOfQuestions} questions, ${marks} marks, ${difficultyLevel}% difficulty, from Page ${startingFrom} to Page ${endingAt}, requirements: "${requirements}")`
    );

    console.log("Processing file...");
    const pages = await ProcessFile(file, type);
    console.log("File processed");

    console.log("Picking context pages...");

    const randomPages = getRandomPages(
      startingFrom && endingAt
        ? pages.slice(startingFrom - 1, endingAt)
        : pages,
      numberOfQuestions,
      difficultyLevel
    );

    console.log(
      `Generating assessment from pages: ${randomPages.pages.join(", ")} ...`
    );
    const assessment = await GenerateQuestions(
      numberOfQuestions,
      randomPages.content,
      marks,
      difficultyLevel,
      requirements
    );

    console.log(assessment);

    if (assessment !== "") {
      JSON.parse(
        JSON.stringify(
          assessment
            .replaceAll("\n", "")
            .replaceAll("\r", "")
            .replaceAll("\t", "")
        )
      );
      console.log("Assessment successfully generated");

      return new NextResponse(
        JSON.stringify({
          assessment: assessment
            .replaceAll("\n", "")
            .replaceAll("\r", "")
            .replaceAll("\t", ""),
          context: randomPages.content
            .join("           ")
            .replaceAll("\n", "")
            .replaceAll("\r", "")
            .replaceAll("\t", ""),
        })
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

const getRandomPages = (
  pages: string[],
  numberOfQuestions: number,
  difficultyLevel: number
) => {
  let pageNumbers: number[] = [];
  let pageContent: string[] = [];

  for (let i = 0; i < numberOfQuestions; i++) {
    const difficultyPercentage = difficultyLevel / 100;
    const pagesLength = pages.length;
    const firstTwentyPercent = Math.floor(pagesLength * 0.2);
    const secondTwentyPercent = Math.floor(pagesLength * 0.4);
    const thirdTwentyPercent = Math.floor(pagesLength * 0.6);
    const fourthTwentyPercent = Math.floor(pagesLength * 0.8);

    let randomPageIndex;
    if (difficultyPercentage < 0.2) {
      randomPageIndex = Math.floor(Math.random() * firstTwentyPercent);
    } else if (difficultyPercentage < 0.4) {
      randomPageIndex = Math.floor(
        Math.random() * (secondTwentyPercent - firstTwentyPercent) +
          firstTwentyPercent
      );
    } else if (difficultyPercentage < 0.6) {
      randomPageIndex = Math.floor(
        Math.random() * (thirdTwentyPercent - secondTwentyPercent) +
          secondTwentyPercent
      );
    } else if (difficultyPercentage < 0.8) {
      randomPageIndex = Math.floor(
        Math.random() * (fourthTwentyPercent - thirdTwentyPercent) +
          thirdTwentyPercent
      );
    } else {
      randomPageIndex = Math.floor(
        Math.random() * (pagesLength - fourthTwentyPercent) +
          fourthTwentyPercent
      );
    }

    if (
      !pageNumbers.includes(randomPageIndex) &&
      !pageNumbers.includes(randomPageIndex + 1)
    ) {
      pageNumbers.push(randomPageIndex);
      pageNumbers.push(randomPageIndex + 1);
      pageContent.push(`PAGE NUMBER ${randomPageIndex}: 
    
    ${pages[randomPageIndex]}`);
      pageContent.push(`PAGE NUMBER ${randomPageIndex + 1}: 
    
    ${pages[randomPageIndex + 1]}`);
    }
  }

  return {
    pages: pageNumbers,
    content: pageContent,
  };
};
