import { chatModel } from "./aiConfig.js";
import { RAG_PROMPT } from "./prompt.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

export const createChain = async (vectorStore) => {
  try {
    //Create the prompt template with context
    const prompt = ChatPromptTemplate.fromTemplate(RAG_PROMPT);

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
  } catch (e) {
    console.log(e);
    console("An error occured while creating chain");
    throw e;
  }
};
