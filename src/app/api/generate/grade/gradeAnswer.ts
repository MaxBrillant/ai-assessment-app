"use server";
import { submissionSchema } from "@/app/validation/submissionValidation";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";
import { ChatGroq } from "@langchain/groq";

export const gradeAnswer = async (
  question: string,
  answer: string,
  submittedAnswer: string,
  marks: number
) => {
  try {
    const gradeSchema = z.object({
      marks: submissionSchema.shape.submission.element.shape.marks,
      comment: submissionSchema.shape.submission.element.shape.comment,
    });

    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.1-70b-versatile",
      temperature: 0.3,
      maxTokens: 4096,
    });

    const parser = StructuredOutputParser.fromZodSchema(gradeSchema);

    console.log(`Starting to grade the answer to the question "${question}"`);

    const prompt = ChatPromptTemplate.fromTemplate(`
      You are an expert educator tasked with grading an answer to the question asked.
      
      Format Instructions: {format_instructions}
    
    
      Question asked:
      {question}


    
      Real answer:
      {answer}



      Submitted answer:
      {submittedAnswer}


      Total marks:
      {marks}
    
    
      
      Rules to follow:
      1. Return a JSON object matching the specified schema in the Format Instructions, NOTHING ELSE. Format the output as a JSON object matching the specified schema
      3. The "marks" field should be a number between 0 and ${marks}, representing the number of marks the submitted answer should receive, based on their provided answer, compared to the real answer
      2. If the submitted answer is empty, or is not present, just give a 0 mark
      4. The "comment" field should contain your expert-level and detailed comments on why the submitted answer received those marks, where they did wrong, the mistakes they made, and what they should have done instead
      5. The language of the comment provided must be the one used in the context
      `);

    const chain = RunnableSequence.from([prompt, model as any, parser]);

    const response = await chain.invoke({
      question: question,
      answer: answer,
      submittedAnswer: submittedAnswer,
      marks: marks,
      format_instructions: parser.getFormatInstructions(),
    });

    const grade: z.infer<typeof gradeSchema> = JSON.parse(
      JSON.stringify(response)
        .replaceAll("\n", "")
        .replaceAll("\r", "")
        .replaceAll("\t", "")
    );

    console.log("Answer successfully graded");

    return grade;
  } catch (e) {
    throw new Error(`Error while grading the answer, the error is: ${e}`);
  }
};
