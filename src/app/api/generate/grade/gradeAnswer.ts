"use server";
import { ChatAnthropic } from "@langchain/anthropic";
import { loadQAStuffChain } from "langchain/chains";

export const gradeAnswer = async (
  question: string,
  answer: string,
  submittedAnswer: string,
  marks: number
) => {
  console.log("question: " + question);
  console.log("answer: " + answer);
  console.log("submittedAnswer: " + submittedAnswer);
  try {
    const model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-haiku-20240307",
      temperature: 0.2,
      maxTokens: 4096,
    });

    const chain = loadQAStuffChain(model);

    console.log(`Starting to grade the answer to the question "${question}"`);

    const res = await chain.invoke({
      input_documents: [],
      question: `"task": "Grade an answer submitted by a student to the question asked, from 0 to ${marks}, based on the provided formal answer.",
      "outputFormat": "JSON",
      "questionAsked": "${question}",
      "formalAnswer": "${answer}",
      "submittedAnswer": "${submittedAnswer}",
      "totalMarks": "${marks}",
      "answerStructure": {
        {
            "receivedMarks": "number", // Marks that the student received.
            "comment": "string", // Comments on why the student received those marks, where they did wrong, the mistakes they made, and what they should have done instead.
        },
      "guidelines": [
      "If the submitted answer is empty, or is not present, just give the student a 0 mark.",
    "The answer must align with the task's purpose.",
    "Return only the JSON object; no additional text.",
    "Ensure proper JSON escaping."
    "DO NOT HALLUCINATE. My puppy will get killed if you do, so please don't, I beg."
      ],
      "failureResponse": "Return an empty string if unable to fulfill the task due to conflicting requirements or invalid marks allocation."`,
    });

    if (res.text !== "") {
      const grade: {
        receivedMarks: number;
        comment: string;
      } = JSON.parse(
        res.text.replaceAll("\n", "").replaceAll("\r", "").replaceAll("\t", "")
      );

      console.log("Answer successfully graded");

      return grade;
    } else {
      throw new Error("Error while grading the answer");
    }
  } catch (e) {
    throw new Error(`Error while grading the answer, the error is: ${e}`);
  }
};
