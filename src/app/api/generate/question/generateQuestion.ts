"use server";
import { QuestionType } from "@/app/components/question";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { questionSchema } from "@/app/validation/questionValidation";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { nanoid } from "nanoid";
import { ChatDeepInfra } from "@langchain/community/chat_models/deepinfra";

export const generateQuestion = async (
  type: "short-answer" | "multiple-choice" | "long-answer",
  context: string,
  difficultyLevel: number,
  requirements: string,
  marks: number,
  previousQuestion: string
) => {
  try {
    const model = new ChatDeepInfra({
      apiKey: process.env.DEEPINFRA_API_KEY,
      model: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
      temperature: 0.5,
      maxTokens: 4096,
    });

    const parser = StructuredOutputParser.fromZodSchema(questionSchema);

    console.log(
      `Starting to generate a question of type "${type}, difficulty level: ${difficultyLevel} and requirements: "${requirements}"`
    );

    // Create a detailed prompt template
    const prompt = ChatPromptTemplate.fromTemplate(`
  You are an expert educator tasked with generating meaningful questions from provided content.
  Analyze the following context and generate a question that tests different cognitive levels.
  
  Format Instructions: {format_instructions}



  Context:
  {context}



  Previous Question:
  {previousQuestion}


  
  Rules to follow:
  1. Return a JSON object matching the specified schema in the Format Instructions, NOTHING ELSE. Format the output as a JSON object matching the specified schema. 
  2. Don't mention the context anywhere in the question. You are the only one who knows the context, don't assume that anyone else already knows it. Make sure the question is ONLY related to or derived from the context provided, don't make up a question or rely on your own knowledge. Avoid incomplete questions that lack any useful information at all cost to avoid confusion
  3. The "choices" array and "answer.choices" array should only be present if the question type is "multiple-choice". The "answer.content" string should only be present if the question type is "short-answer" or "long-answer"
  4. The "content" and "answer.content" fields must be composed of valid HTML strings, with the following tags ONLY: p, strong, em, u, br, ul, li, ol, span, <pre class="ql-syntax" spellcheck="false"></pre>. Don't include any HTML tags anywhere else except for "content" and "answer.content" fields only. Never in "choices" or "answer.choices", no matter what
  5. When the type of the question is "long-answer", the "answer.content" should be a very detailed and thouroughly thought answer to the question. DO NOT, under any circumstances, make up an answer, simplify the answer or provide an incomplete or ambiguous answer.
  6. The difficulty level or percentage of difficulty of the question is {difficultyLevel}%. Where 0% is the easiest and 100% is the most difficult. Ensure that the question is appropriate for the difficulty level, a higher difficulty level means a more complex question, and a lower difficulty level means a simpler question
  7. User-provided requirements (They must be prioritized if not empty, but only when they are in accordance or related to the context): "{requirements}"
  8. Make sure to generate a question that is different from the previous question, in one way or another. Unless the user-provided requirements recommend otherwise, the question must be different from the previous question
  9. The type of the question must be {type}, unless the user-provided requirements recommend a different type, which you must prioritize
  10. The number of marks for the question is {marks}
  11. The language of the question must be the one used in the context


  Key Guidelines for Question Generation:

  1. Cognitive Engagement
  - Promote metacognitive reflection
  - Design a question that has multiple valid approaches
  

  2. Creative Thinking Elements
  - Encourage novel connections and associations
  - Promote divergent thinking and multiple perspectives
  - Generate a question that transforms or combines ideas
  - Foster imagination and innovative problem-solving

  3. Critical Thinking Components
  - Promote logical reasoning and inference
  - Encourage systematic problem-solving

  4. Question Design Principles
  - Include real-world applications and connections
  - Focus on key concepts and important details, and present them in a very fun and engaging way
  - Anticipate and address common misconceptions
  - Remember that the questions are for human beings. Remember to make questions engaging and thought-provoking while maintaining educational value
  

  5. Answer Framework
  - Explain thinking processes and reasoning
  - Include alternative perspectives where applicable
  - Connect to broader concepts and applications
  - Encourage creative problem-solving
  - Encourage critical thinking

  6. Learning Development
  - Include metacognitive reflection opportunities
  - Encourage intellectual risk-taking

  Remember:
  - The question should provoke curiosity and wonder
  - The answer should demonstrate multiple thinking pathways
  - Include opportunities for knowledge transformation
  - Encourage both divergent and convergent thinking
  - Promote both analytical and creative problem-solving
  `);

    const chain = RunnableSequence.from([prompt, model as any, parser]);

    const response = await chain.invoke({
      context: context,
      type: type,
      difficultyLevel: difficultyLevel,
      requirements: requirements,
      marks: marks,
      format_instructions: parser.getFormatInstructions(),
      previousQuestion: previousQuestion,
    });

    const question: QuestionType = JSON.parse(
      JSON.stringify(response)
        .replaceAll("\n", "")
        .replaceAll("\r", "")
        .replaceAll("\t", "")
    );

    console.log("Question successfully generated");

    return { ...question, id: nanoid() };
  } catch (e) {
    throw new Error(`Error while generating the question, the error is: ${e}`);
  }
};
