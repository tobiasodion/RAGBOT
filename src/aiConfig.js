import { ChatOpenAI } from "@langchain/openai";

export const chatModel = new ChatOpenAI({
  temperature: 0,
  model: "gpt-4-turbo",
});
