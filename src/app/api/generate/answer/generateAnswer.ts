"use server";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { queryVectorStore } from "../../document/vectorStore";
import { reduceCredits } from "../../auth/createUserProfile";
import { ChatDeepInfra } from "@langchain/community/chat_models/deepinfra";

export const generateAnswer = async (props: {
  documentId: string;
  type: "short-answer" | "long-answer";
  question: string;
  difficultyLevel: number;
  requirements: string;
}) => {
  try {
    const context = await queryVectorStore(props.documentId, props.question, 1);

    const model = new ChatDeepInfra({
      apiKey: process.env.DEEPINFRA_API_KEY,
      model: `${
        props.type === "long-answer"
          ? "deepseek-ai/DeepSeek-R1-Distill-Llama-70B"
          : "meta-llama/Meta-Llama-3.1-70B-Instruct"
      }`,
      temperature: 0.6,
      maxTokens: 4096,
    });

    const answerSchema = z.object({
      type: z.enum(["short-answer", "long-answer"]),
      marks: z.number(),
      answer: z.string(),
    });

    const parser = StructuredOutputParser.fromZodSchema(answerSchema);

    console.log(
      `Starting to generate an answer of type "${props.type} to the question "${props.question}"`
    );

    const prompt = ChatPromptTemplate.fromTemplate(`
      You are an expert educator tasked with giving an answer to a question based on the provided context.
      
      Format Instructions: {format_instructions}
    

      Question:
      {question}   
    
      
      Rules to follow:
      1. Return a JSON object matching the specified schema in the Format Instructions, NOTHING ELSE. Format the output as a JSON object matching the specified schema
      2. Don't mention the context anywhere in the answer. You are the only one who knows the context, don't assume that anyone else already knows it. Make sure the answer is ONLY related to or derived from the context provided. Avoid incomplete answers that lack any useful information at all cost to avoid confusion
      3. The "answer" field must be composed of valid HTML strings, with the following tags ONLY: p, strong, em, u, br, ul, li, ol, span, <pre class="ql-syntax" spellcheck="false"></pre>
      4. The "answer" field must have less than 2000 characters
      4. When the type of the answer is "long-answer", the "answer.content" should be a very detailed and thouroughly thought answer to the question. DO NOT, under any circumstances, make up an answer
      5. The difficulty level or percentage of difficulty of the answer is {difficultyLevel}%. Where 0% is the easiest and 100% is the most difficult. Ensure that the answer is appropriate for the difficulty level, a higher difficulty level means a more complex answer, and a lower difficulty level means a simpler answer
      6. User-provided requirements (They must be prioritized if not empty, but only when they are in accordance or related to the context): "{requirements}"
      7. The type of the answer must be {type}
      8. The language of the answer must be the one used in the context
      
    
    
      Key Guidelines for Answer Generation:
    
      1. Critical Thinking Components
      - Require evaluation of evidence and arguments
      - Promote logical reasoning and inference
      - Include analysis of assumptions and biases
      - Encourage systematic problem-solving
    
      2. Answer Framework
      - Explain thinking processes and reasoning
      - Include alternative perspectives where applicable
      - Connect to broader concepts and applications
    
      3. Learning Development
      - Build from foundational to expert-level thinking
      - Include metacognitive reflection opportunities
      - Promote transfer of learning to new contexts
      - Encourage intellectual risk-taking
    
      Remember:
      - The answer should demonstrate multiple thinking pathways
      - Include opportunities for knowledge transformation
      - Encourage both divergent and convergent thinking
      - Promote both analytical and creative problem-solving


    
      Context:
      {context}

      `);

    const chain = RunnableSequence.from([prompt, model as any, parser]);

    const response = await chain.invoke({
      context: context[0].pageContent,
      question: props.question,
      type: props.type,
      difficultyLevel: props.difficultyLevel,
      requirements: props.requirements,
      format_instructions: parser.getFormatInstructions(),
    });

    const answer: z.infer<typeof answerSchema> = JSON.parse(
      JSON.stringify(response)
        .replaceAll("\n", "")
        .replaceAll("\r", "")
        .replaceAll("\t", "")
        .replace(/<think>.*?<\/think>/g, "")
    );

    console.log("Answer successfully generated");

    console.log("Reducing user credits...");

    await reduceCredits(props.type === "long-answer" ? 2 : 1);

    return answer;
  } catch (e) {
    throw new Error(`Error while generating the answer, the error is: ${e}`);
  }
};
