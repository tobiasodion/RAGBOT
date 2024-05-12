import { chatModel } from "./aiConfig.js";
import { RAG_PROMPT } from "./prompt.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const createChain = async (vectorStore) => {
  const input = vectorStore ? RAG_PROMPT : "{input}";
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a world class technical documentation writer."],
    ["user", input],
  ]);

  if (!vectorStore) {
    const outputParser = new StringOutputParser();
    const llmChain = prompt.pipe(chatModel).pipe(outputParser);
    return llmChain;
  }

  const documentChain = await createStuffDocumentsChain({
    llm: chatModel,
    prompt,
  });

  const retriever = vectorStore.asRetriever();

  const retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever,
  });

  return retrievalChain;
};
