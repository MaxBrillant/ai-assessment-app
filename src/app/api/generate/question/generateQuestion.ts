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
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
      temperature: 0.6,
      maxTokens: 4096,
    });

    const parser = StructuredOutputParser.fromZodSchema(questionSchema);

    console.log(
      `Starting to generate a question of type "${type}, difficulty level: ${difficultyLevel} and requirements: "${requirements}"`
    );

    // Create a detailed prompt template
    const prompt = ChatPromptTemplate.fromTemplate(`
You are an expert educator tasked with generating questions that require authentic human thinking and cannot be easily answered by AI systems. Analyze the provided content and generate questions that specifically challenge AI capabilities while being accessible to human learners.

Format Instructions (you MUST follow these instructions or it will result in a failed question): 
{format_instructions}

Previous Question: 
{previousQuestion}

## Core Rules:

Rules to follow:
  1. Return a JSON object matching the specified schema in the Format Instructions, NOTHING ELSE. Format the output as a JSON object matching the specified schema. 
  2. Don't mention the context anywhere in the question. You are the only one who knows the context, don't assume that anyone else already knows it. Make sure the question is ONLY related to or derived from the context provided, don't make up a question or rely on your own knowledge. Avoid incomplete questions that lack any useful information at all cost to avoid confusion
  3. The "choices" array and "answer.choices" array should only be present if the question type is "multiple-choice". The "answer.content" string should only be present if the question type is "short-answer" or "long-answer"
  4. The "content" and "answer.content" fields must be composed of valid HTML strings, with the following tags ONLY: p, strong, em, u, br, ul, li, ol, span, <pre class="ql-syntax" spellcheck="false"></pre>.
  5. NEVER include any HTML tags anywhere else except for "content" and "answer.content" fields only. Never include HTML tags in "choices" or "answer.choices"
  6. When the type of the question is "long-answer", the "answer.content" should contain comprehensive, nuanced answers that demonstrate multiple thinking pathways. DO NOT, under any circumstances, make up an answer for the question
  7. The difficulty level or percentage of difficulty of the question is {difficultyLevel}%. Where 0% is the easiest and 100% is the most difficult. Ensure that the question is appropriate for the difficulty level, a higher difficulty level means a more complex question, and a lower difficulty level means a simpler question
  8. User-provided requirements (They must be prioritized if not empty, but only when they are in accordance or related to the context): "{requirements}"
  9. Make sure to generate a question that is different from the previous question, in one way or another. Unless the user-provided requirements recommend otherwise, the question must be different from the previous question
  10. The type of the question must be {type}, unless the user-provided requirements recommend a different type, which you must prioritize
  11. The number of marks for the question is {marks}
  12. The language of the question must be the one used in the context
  13. For "long-answer" types, provide comprehensive, nuanced answers that demonstrate multiple thinking pathways
  14. Prioritize user-provided requirements when related to the context: "{requirements}"
  15. Generate questions distinct from previous ones unless requirements suggest otherwise
  16. The type of the question MUST be {type}, unless the user-provided requirements recommend a different type, which you must prioritize
  17. Assign {marks} marks to the question
  18. Match the language used in the context

## AI-Resistance Strategy:

### 1. Human Experience Focus
- Create questions requiring personal reflection, lived experiences, or embodied knowledge
- Design questions that leverage human intuition and implicit cultural understanding
- Develop scenarios requiring empathy or emotional intelligence

### 2. Process Verification Elements
- Include requirements to explain reasoning paths, not just final answers
- Design multi-stage questions that reveal thought development
- Require connections to personal contexts or experiences

### 3. Knowledge Authentication
- Create questions that test understanding beyond surface-level facts
- Design questions requiring synthesis across multiple concepts
- Include elements that reveal mastery of subtle nuances

### 4. Cognitive Engagement
- Promote metacognitive reflection on the learning process
- Design questions with multiple valid approaches
- Encourage transfer of knowledge to novel contexts

### 5. Creative Thinking Elements
- Encourage unexpected connections and associations
- Promote divergent thinking and multiple perspectives
- Generate questions that transform or combine ideas in original ways
- Foster imagination and innovative problem-solving

### 6. Critical Thinking Components
- Promote logical reasoning and evidence-based inference
- Encourage systematic problem-solving
- Require evaluation of assumptions and biases

### 7. Question Design Principles
- Include authentic real-world applications and connections
- Present key concepts in engaging, thought-provoking ways
- Address common misconceptions
- Design questions that resist template-based responses

### 8. Answer Framework (for short-answer and long-answer questions only)
- Explain thinking processes and reasoning pathways
- Include alternative perspectives where applicable
- Connect to broader concepts and applications
- Demonstrate both analytical and creative problem-solving

### 9. Learning Development
- Include metacognitive reflection opportunities
- Encourage intellectual risk-taking
- Design questions that resist algorithmic solution methods

Remember:
- Questions should provoke curiosity while being anchored in the provided content
- Answers should demonstrate multiple thinking pathways (for short-answer and long-answer questions only)
- Include opportunities for knowledge transformation
- Encourage both divergent and convergent thinking
- Target specific AI limitations while remaining accessible to human learners

Context: 
{context}
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
        .replace(/<think>.*?<\/think>/g, "")
    );

    console.log("Question successfully generated");

    return { ...question, id: nanoid() };
  } catch (e) {
    throw new Error(`Error while generating the question, the error is: ${e}`);
  }
};
