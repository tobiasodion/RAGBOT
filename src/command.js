import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { indexDocuments } from "./indexer.js";
import { askQuestion } from "./chatbot.js";
import { writeToFile } from "./utils/file.js";
import { crawlWebsite } from "./crawler.js";
import { createChain } from "./chain.js";
import { model } from "./aiConfig.js";

yargs(hideBin(process.argv))
  .command(
    "simple",
    "start the chatbot to answer questions based on a custom LLM",
    async () => {
      console.log(
        `Welcome to RAGBOT!\nYour questions will be answered based on information on the ${model} LLM\nType your questions or type "q" to quit.`
      );

      const chain = await createChain();
      askQuestion(chain);
    }
  )
  .command(
    "rag <url>",
    "Start the chatbot to answer questions based on information from the website",
    (yargs) => {
      return yargs.positional("url", {
        describe: "url of website to serve as context",
      });
    },
    async (argv) => {
      try {
        const url = argv.url.replace(/www\./gi, "");
        const crawlDepth = argv.depth;
        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#]+\.[^\s/$.?#]+/i;
        if (!urlRegex.test(url)) {
          console.log("Invalid url", argv.url);
          throw new Error();
        }

        const websiteUrl = new URL(url);
        console.log(`Initializing the chatbot for ${websiteUrl}`);
        const DATA_FOLDER = process.env.DATA_FOLDER || "";
        const urlDomain = websiteUrl.hostname;
        const linksJsonPath = `${DATA_FOLDER}/${urlDomain}/links_${new Date().toISOString()}.json`;

        console.log(`Attempting to crawl ${websiteUrl}`);
        const linksToIndex = await crawlWebsite(
          websiteUrl.toString(),
          crawlDepth,
          urlDomain
        );

        await writeToFile(
          linksJsonPath,
          JSON.stringify(
            {
              startUrl: websiteUrl.toString(),
              crawlDepth,
              linksCount: linksToIndex.length,
              links: linksToIndex,
            },
            null,
            2
          )
        );

        if (linksToIndex.length === 0) {
          console.log("No links to index.");
          throw new Error();
        }

        const vectorStore = await indexDocuments(linksToIndex);
        console.log(
          `Welcome to RAGBOT!\nYour questions will be answered based on information from ${argv.url}\nType your questions or type "q" to quit.`
        );

        const chain = await createChain(vectorStore);
        askQuestion(chain);
      } catch (e) {
        console.log(e);
        console.log("Oops! something went wrong");
        process.exit(1);
      }
    }
  )
  .option("depth", {
    alias: "d",
    type: "number",
    description: "the depth to which the url should be crawled",
    default: 0,
  })
  .demandCommand(1)
  .parse();
