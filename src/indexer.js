import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

export const indexDocuments = async (links) => {
  let totaldocs = [];
  //Load data from the configured website

  await Promise.all(
    links.map(async (link) => {
      try {
        const loader = new CheerioWebBaseLoader(link, { timeout: 60000 });
        const docs = await loader.load();
        console.log("indexed content from", link);
        totaldocs = [...totaldocs, ...docs];
      } catch (e) {
        console.log(e);
        console.log("Error occured while indexing", link);
      }
    })
  );

  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(totaldocs);

  const embeddings = new OpenAIEmbeddings();
  return await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
};
