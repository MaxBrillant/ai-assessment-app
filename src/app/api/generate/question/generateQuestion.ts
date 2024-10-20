"use server";
import { Document } from "langchain/document";
import { ChatAnthropic } from "@langchain/anthropic";
import { loadQAStuffChain } from "langchain/chains";
import { QuestionType } from "@/app/components/question";

export const generateQuestion = async (
  previousQuestion: string,
  type: "short-answer" | "multiple-choice" | "long-answer",
  context: string,
  difficultyLevel: number,
  requirements: string | undefined,
  newRequirement: string
) => {
  try {
    // const model = new ChatGroq({
    //   apiKey: process.env.GROQ_API_KEY,
    //   model: "llama-3.1-70b-veratile",
    //   temperature: 0.2,
    //   maxTokens: 8000,
    // });

    const model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-haiku-20240307",
      temperature: 0.2,
      maxTokens: 4096,
    });

    const chain = loadQAStuffChain(model);

    console.log(
      `Starting to generate a question of type "${type}, difficulty level: ${difficultyLevel} and requirements: "${requirements}"`
    );

    const res = await chain.invoke({
      input_documents: [
        new Document({
          pageContent: JSON.stringify(context),
        }),
      ],
      question: `"task": "Generate a question that is different from the previous question, based on the provided text as context.",
      "outputFormat": "JSON",
      "previousQuestion": "${previousQuestion}",
      "questionStructure":
          {
            "id": "string", // Unique valid uuid4 identifier for each question
            "type": "short-answer" | "long-answer" | "multiple-choice", // In this case, it is of type "${type}".
            "content": "string",  //Content of the question; generate it based on the difficulty and content provided
            "choices": "[string]", // Only for "multiple-choice" type questions.
            "marks": "number", // Marks per question. Vary marks according to difficulty and content.
            "answer": {
              "content": "string", // Answer to the question for "short-answer" and "long-answer" type questions only. Take in consideration the provided context. If the type is "long-answer", make it very detailed and in-depth, and don't leave out any details.
              "choices": "[string]" // Correct choices for "multiple-choice" type questions only.
            }
          },
      "guidelines": [
    "Difficulty level: ${difficultyLevel}% (0% = very easy, 100% = very hard). Adjust marks accordingly.",
    "Requirements that were used to generate the previous question: ${requirements}",
    "Newly provided requirements: ${newRequirement}",
    "Vary marks per question based on difficulty and content; avoid uniform marking.",
    "Questions and answers must align with the task's purpose.",
    "Return only the JSON object; no additional text.",
    "Ensure proper JSON escaping."
    "DO NOT HALLUCINATE. My puppy will get killed if you do, so please don't, I beg."
      ],
      "failureResponse": "Return an empty string if unable to fulfill the task due to conflicting requirements or invalid marks allocation."`,
    });

    if (res.text !== "") {
      const question: QuestionType = JSON.parse(
        res.text.replaceAll("\n", "").replaceAll("\r", "").replaceAll("\t", "")
      );

      console.log("Question successfully generated");

      return question;
    } else {
      throw new Error(
        "Error while generating the question. Please change your requirements and try again"
      );
    }
  } catch (e) {
    throw new Error(`Error while generating the question, the error is: ${e}`);
  }
};
