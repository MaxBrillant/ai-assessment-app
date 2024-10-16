"use server";
import { Document } from "langchain/document";
import { ChatAnthropic } from "@langchain/anthropic";
import { loadQAStuffChain } from "langchain/chains";

export const generateAssessment = async (
  numberOfQuestions: number,
  content: string[],
  marks: number,
  difficultyLevel: number,
  requirements: string
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

    const res = await chain.invoke({
      input_documents: [
        new Document({
          pageContent: JSON.stringify(
            content.map((contentPages, index) => {
              return "Content pages " + (index + 1) + ": " + contentPages;
            })
          ),
        }),
      ],
      question: `"task": "Generate an assessment based on the provided text as context.",
      "outputFormat": "JSON",
      "assessmentStructure": {
        "title": "string", // Clear title of the assessment.
        "totalMarks": "number", // Total marks for all questions combined.
        "questions": [  // array of exactly ${numberOfQuestions} items (from 1 to ${numberOfQuestions})
          {
            "id": "string", // Unique valid uuid4 identifier for each question
            "type": "short-answer" | "long-answer" | "multiple-choice", // Alternate between types; no more than two consecutive of the same type.
            "content": "string",  //Content of the question; generate it based on the difficulty and content provided
            "choices": ["string"], // Only for "multiple-choice" type questions.
            "marks": "number", // Marks per question. Vary marks according to difficulty and content. Most importantly, the total of all marks must equal ${marks}
            "answer": {
              "content": "string", // Answer to the question according to the context. If the type is "long-answer", make it very detailed and in-depth, and don't leave out any details. Only for "short-answer" and "long-answer" type questions, don't provide it for "multiple-choice" type questions.
              "choices": ["string"] // Correct choices for "multiple-choice" type questions only.
            }
          }
        ]
      },
      "guidelines": [
        "Alternate question types.",
    "Difficulty level: ${difficultyLevel}% (0% = very easy, 100% = very hard). Adjust marks accordingly.",
    "Requirements: ${requirements}",
    "Total marks across questions must match ${marks} exactly.",
    "Vary marks per question based on difficulty and content; avoid uniform marking.",
    "Questions and answers must align with the task's purpose.",
    "Return only the JSON object; no additional text.",
    "Ensure proper JSON escaping."
    "DO NOT HALLUCINATE. My puppy will get killed if you do, so please don't, I beg."
      ],
      "failureResponse": "Return an empty string if unable to fulfill the task due to conflicting requirements or invalid marks allocation."`,
    });

    return res.text;
  } catch (e) {
    throw new Error(`Error while generating questions, the error is: ${e}`);
  }
};
