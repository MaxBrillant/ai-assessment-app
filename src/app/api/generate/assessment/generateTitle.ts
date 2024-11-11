import { ChatAnthropic } from "@langchain/anthropic";
export async function generateTitle(content: string) {
  try {
    const model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-3-5-haiku-20241022",
      temperature: 0.7,
      maxTokens: 4096,
    });

    const result = await model.invoke([
      [
        "system",
        `Your role is to provide a less than 70 characters title for an assessment given a specific chunk of content. You shall ONLY return a JSON object of the following structure: {"title": "string"}. Nothing else.`,
      ],
      ["human", `Here is the content of the assessment: ${content}`],
    ]);

    console.log(result.content);
    const newObject: { title: string } = JSON.parse(
      result.content
        .toString()
        .replaceAll("\n", "")
        .replaceAll("\r", "")
        .replaceAll("\t", "")
    );
    return newObject.title;
  } catch (e) {
    throw new Error(`Error while generating the title: ${e}`);
  }
}
