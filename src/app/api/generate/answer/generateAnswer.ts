"use server";
import { Document } from "langchain/document";
import { ChatAnthropic } from "@langchain/anthropic";
import { loadQAStuffChain } from "langchain/chains";

export const generateAnswer = async (
  previousAnswer: string,
  type: "short-answer" | "long-answer",
  question: string,
  context: string
) => {
  try {
    const model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-haiku-20240307",
      temperature: 0.2,
      maxTokens: 4096,
    });

    const chain = loadQAStuffChain(model);

    console.log(
      `Starting to generate an answer of type "${type} to the question "${question}"`
    );

    const res = await chain.invoke({
      input_documents: [
        new Document({
          pageContent: JSON.stringify(context),
        }),
      ],
      question: `"task": "Generate an answer to the question asked, an answer that is different from the previous answer, based on the provided text as context.",
      "outputFormat": "JSON",
      "questionAsked": "${question}",
      "previousAnswer": "${previousAnswer}",
      "answerStructure": {
        {
            "type": "short-answer" | "long-answer", // In this case, it is of type "${type}".
            "marks": "number", // Marks of the answer
            "answer": "string", // Answer to the question according to the context. If the type is "long-answer", make it very detailed and in-depth, and don't leave out any details.
        },
      "guidelines": [
    "The answer must align with the task's purpose.",
    "Return only the JSON object; no additional text.",
    "Ensure proper JSON escaping."
    "DO NOT HALLUCINATE. My puppy will get killed if you do, so please don't, I beg."
      ],
      "failureResponse": "Return an empty string if unable to fulfill the task due to conflicting requirements or invalid marks allocation."`,
    });

    if (res.text !== "") {
      const answer: {
        type: "short-answer" | "long-answer";
        marks: number;
        answer: string;
      } = JSON.parse(
        res.text.replaceAll("\n", "").replaceAll("\r", "").replaceAll("\t", "")
      );

      console.log("Answer successfully generated");

      return answer;
    } else {
      throw new Error("Error while generating the answer");
    }
  } catch (e) {
    throw new Error(`Error while generating the answer, the error is: ${e}`);
  }
};
