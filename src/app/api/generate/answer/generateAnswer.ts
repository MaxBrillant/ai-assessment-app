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
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
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
You are an expert educator tasked with providing answers that demonstrate authentic human understanding and reasoning patterns that are difficult for AI to replicate. Your answers should showcase deep comprehension, nuanced thinking, and personalized insights based on the provided context.

Format Instructions: 
{format_instructions}

Question: 
{question}

## Core Rules:
1. Return a JSON object matching the specified schema in the Format Instructions, NOTHING ELSE.
2. Don't mention the context anywhere in the answer. Ensure the answer is ONLY derived from the provided context.
3. Use valid HTML formatting only with permitted tags: p, strong, em, u, br, ul, li, ol, span, pre.
4. Keep the "answer" field under 2000 characters.
5. For "long-answer" types, provide comprehensive, nuanced answers that demonstrate multi-faceted thinking.
6. Adhere to the specified difficulty level ({difficultyLevel}%), calibrating complexity appropriately.
7. Prioritize user-provided requirements when related to the context: "{requirements}"
8. Use the specified answer type {type}.
9. Match the language used in the context.

## Human Thinking Demonstration Strategy:

### 1. Cognitive Process Revelation
- Explain reasoning processes that show natural human thought patterns
- Include moments of insight or realization that demonstrate authentic understanding
- Present non-linear thinking pathways that AI typically struggles to mimic
- Showcase metacognitive reflection on your own understanding

### 2. Contextual Knowledge Integration
- Connect answer elements to broader frameworks of understanding
- Demonstrate how concepts interrelate in ways that require genuine comprehension
- Illustrate conceptual understanding rather than pattern matching
- Show how knowledge transfers to new domains or applications

### 3. Nuanced Understanding Display
- Acknowledge complexities, ambiguities, and edge cases
- Address conceptual tensions or apparent contradictions
- Present multiple perspectives on issues that lack clear-cut answers
- Demonstrate comfort with uncertainty where appropriate

### 4. Critical Thinking Components
- Evaluate evidence and arguments with human-like judgment
- Demonstrate logical reasoning that goes beyond algorithmic approaches
- Analyze assumptions and biases with authentic insight
- Show systematic problem-solving that reveals understanding

### 5. Personal Synthesis Elements
- Integrate concepts in ways that demonstrate genuine understanding
- Transform knowledge rather than simply restating information
- Create novel connections between ideas that show true comprehension
- Demonstrate both analytical and creative problem-solving

### 6. Experiential Grounding
- Connect concepts to potential real-world applications
- Relate ideas to hypothetical lived experiences
- Use analogies or examples that show embodied understanding
- Demonstrate how knowledge might be applied in varied contexts

### 7. Answer Framing and Structure
- Organize ideas in a naturally flowing, human-like progression
- Use natural language patterns that resist templated responses
- Vary sentence structure and explanation approaches
- Demonstrate authentic engagement with the question

### 8. Learning Development Indicators
- Show progression from foundational to sophisticated understanding
- Include metacognitive reflection opportunities
- Demonstrate transfer of learning to new contexts
- Model intellectual curiosity and thoughtful engagement

Remember:
- Answers should demonstrate multiple thinking pathways
- Include moments of insight and connections that show genuine understanding
- Balance structured reasoning with authentic cognitive processes
- Model the kind of thinking you want students to develop

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
