"use server";
import { assessmentSchema } from "@/app/validation/assessmentValidation";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatDeepInfra } from "@langchain/community/chat_models/deepinfra";
export async function generateTitle(content: string) {
  const titleSchema = assessmentSchema.pick({
    title: true,
  });
  try {
    const model = new ChatDeepInfra({
      apiKey: process.env.DEEPINFRA_API_KEY,
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
      temperature: 0.1,
      maxTokens: 1000,
    });

    const parser = StructuredOutputParser.fromZodSchema(titleSchema);

    const prompt = ChatPromptTemplate.fromTemplate(
      `
  You are an expert educator. Your role is to provide a less than 70 characters title for an assessment given a specific chunk of context.
  
  Format Instructions:
  {format_instructions}


  Context:
  {context}

  
  Rules to follow:
  1. Return a JSON object matching the specified schema in the Format Instructions, NOTHING ELSE. Format the output as a JSON object matching the specified schema
  2. Make an understandable and meaningful title for the assessment. Something that resonates well with the context provided
  3. The language of the title must be the one used in the context
  4. The title must be less than 70 characters
`
    );

    const chain = RunnableSequence.from([prompt, model as any, parser]);
    const response = await chain.invoke({
      context: content,
      format_instructions: parser.getFormatInstructions(),
    });

    const newObject: { title: string } = JSON.parse(
      JSON.stringify(response)
        .replaceAll("\n", "")
        .replaceAll("\r", "")
        .replaceAll("\t", "")
    );
    return newObject.title;
  } catch (e) {
    throw new Error(`Error while generating the title: ${e}`);
  }
}
