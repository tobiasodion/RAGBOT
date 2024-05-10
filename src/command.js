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
      "Start the chatbot to respond to questions about the website identified by the url",
    handler: async (argv) => {
      try {
        const url = argv.url.replace(/www\./gi, "");
        const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#]+\.[^\s/$.?#]+/i;
        if (!urlRegex.test(url)) {
          console.log("Invalid url", argv.url);
          throw new Error();
        }

        const websiteUrl = new URL(url);
        console.log(`Initializing the chatbot for ${websiteUrl}...`);
        const DATA_FOLDER = process.env.DATA_FOLDER || "";
        const CRAWL_MAX_DEPTH = process.env.CRAWL_MAX_DEPTH || "";
        const urlDomain = websiteUrl.hostname;
        const linksJsonPath = `${DATA_FOLDER}/${urlDomain}/links.json`;

        const linksToIndex = await readFromFile(linksJsonPath);
        let linksToIndexJson = JSON.parse(linksToIndex);

        if (!linksToIndexJson) {
          console.log(
            `No link found in json file. Attempting to crawl ${websiteUrl}`
          );
          linksToIndexJson = await crawlWebsite(
            websiteUrl.toString(),
            CRAWL_MAX_DEPTH,
            urlDomain
          );

          await writeToFile(
            linksJsonPath,
            JSON.stringify(linksToIndexJson, null, 2)
          );
        }

        if (!linksToIndexJson) {
          console.log("No links to index.");
        }

        const vectorStore = await indexDocuments(linksToIndexJson);
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
