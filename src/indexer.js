import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { TextLoader } from "langchain/document_loaders/fs/text";

const links = [
  "https://immigration.gov.ng/#passport-section",
  "https://immigration.gov.ng/passport-applying-from-nigeria/",
  "https://immigration.gov.ng/passport-applying-from-outside-nigeria/",
  "https://immigration.gov.ng/current-and-past-leaders-of-the-nis/",
  "https://immigration.gov.ng/visa_group/this-is-the-visa-group/",
  "https://immigration.gov.ng/visa_group/exchange-journalism-religious-sports-entertainment/",
  "https://immigration.gov.ng/visa_group/employment/",
  "https://immigration.gov.ng/visa_group/diplomatic/",
  "https://immigration.gov.ng/visa_group/academic/",
  "https://immigration.gov.ng/visa_group/business/",
  "https://immigration.gov.ng/visa_group/nigerians-by-birth-and-their-relatives/",
  "https://immigration.gov.ng/visa_group/temporary-work-permit/",
  "https://immigration.gov.ng/visa_group/highly-skilled-immigrants-and-retirees/",
  "https://immigration.gov.ng/visa_group/relatives-of-permanent-residents/",
  "https://immigration.gov.ng/convention-travel-document/",
  "https://immigration.gov.ng/vision-and-mission/",
  "https://immigration.gov.ng/our-core-mandate/",
  "https://immigration.gov.ng/home-2/nis-structure/",
  "https://immigration.gov.ng/home-2/nis-history/",
  "https://immigration.gov.ng/current-and-past-leaders-of-the-nis/",
];

const texts = ["./specifications/passport-application-requirements.txt"];

export const indexDocuments = async () => {
  let totaldocs = [];
  //Load data from the NIS website

  await Promise.all(
    links.map(async (link) => {
      const loader = new CheerioWebBaseLoader(link);
      const docs = await loader.load();
      totaldocs = [...totaldocs, ...docs];
    })
  );

  await Promise.all(
    texts.map(async (text) => {
      const loader = new TextLoader(text);
      const docs = await loader.load();
      totaldocs = [...totaldocs, ...docs];
    })
  );

  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(totaldocs);

  const embeddings = new OpenAIEmbeddings();
  return await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
};
