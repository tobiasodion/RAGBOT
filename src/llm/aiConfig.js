import { ChatOpenAI } from "@langchain/openai";

export const model = "gpt-4-turbo";
export const chatModel = new ChatOpenAI({
  temperature: 0,
  model,
});
