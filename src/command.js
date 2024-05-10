import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { indexDocuments } from "./indexer.js";
import { askQuestion } from "./chatbot_rag.js";
import { readFromFile, writeToFile } from "./utils/file.js";
import { crawlWebsite } from "./crawler.js";

yargs(hideBin(process.argv))
  .command({
    command: "start <url>",
    describe:
      "Start the chatbot to answer questions based on information from the website",
    builder: {
      depth: {
        describe: "the depth to which the url should be crawled",
        default: 0,
      },
    },
    handler: async (argv) => {
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
          'Welcome to the website chatbot! Type your questions or type "q" to quit.'
        );
        askQuestion(vectorStore);
      } catch (e) {
        console.log(e);
        console.log("Oops! something went wrong");
        process.exit(1);
      }
    },
  })
  .demandCommand(2)
  .parse();
