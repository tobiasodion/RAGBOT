import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const main = async () => {
  const chatModel = new ChatOpenAI({
    temperature: 0,
    model: "gpt-3.5-turbo",
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a world class technical documentation writer."],
    ["user", "{input}"],
  ]);
  const outputParser = new StringOutputParser();

  const llmChain = prompt.pipe(chatModel).pipe(outputParser);

  const result = await llmChain.invoke({
    input:
      "Who is the current comptroller general of Nigeria Immigration service?",
  });

  console.log(result);
};

main();
