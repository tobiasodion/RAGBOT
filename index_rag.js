import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { TextLoader } from "langchain/document_loaders/fs/text";

const main = async () => {
  //Load data from the ISEP website
  // const loader = new CheerioWebBaseLoader(
  //   "https://www.3gpp.org/ftp/Specs/archive/03_series/03.14/"
  // );

  const loader = new TextLoader("./specifications/test.txt");

  const docs = await loader.load();
  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(docs);

  //create embeddings for loaded data from ISEP website and index in in-memory vectorDB
  const embeddings = new OpenAIEmbeddings();
  const vectorstore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );

  //Create the prompt template with context
  const prompt =
    ChatPromptTemplate.fromTemplate(`Answer the following question based only on the provided context:

<context>
{context}
</context>
Question: {input}`);

  //Init the gpt chat model
  const chatModel = new ChatOpenAI({
    temperature: 0,
    model: "gpt-3.5-turbo",
  });

  //init the output parser
  //const outputParser = new StringOutputParser();

  //create the doucment chain from - the model and prompt template
  const documentChain = await createStuffDocumentsChain({
    llm: chatModel,
    prompt,
  });

  const retriever = vectorstore.asRetriever();

  const retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever,
  });

  //query the model
  const result = await retrievalChain.invoke({
    input: "what are the digital values for DTMF",
  });

  //display result
  console.log(result.answer);
};

main();
