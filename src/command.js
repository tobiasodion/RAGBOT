import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { indexDocuments } from "./indexer.js";
import { askQuestion } from "./chatbot_rag.js";
import { readFromFile, writeToFile } from "./utils/file.js";
import { crawlWebsite } from "./crawler.js";

yargs(hideBin(process.argv))
  .command({
    command: "start",
    describe:
      "Start the chatbot to respond to questions about the configured website",
    handler: async () => {
      try {
        console.log("Initializing the website chatbot...");
        const DATA_FOLDER = process.env.DATA_FOLDER || "";
        const WEBSITE_URL = process.env.WEBSITE_URL || "";
        const CRAWL_MAX_DEPTH = process.env.CRAWL_MAX_DEPTH || "";

        const urlDomain = new URL(WEBSITE_URL).hostname;
        const linksJsonPath = `${DATA_FOLDER}/${urlDomain}/links.json`;

        const linksToIndex = await readFromFile(linksJsonPath);
        let linksToIndexJson = JSON.parse(linksToIndex);

        if (!linksToIndexJson) {
          console.log(
            `No link found in json file. Attempting to crawl ${WEBSITE_URL}...`
          );
          linksToIndexJson = await crawlWebsite(
            WEBSITE_URL,
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
      }
    },
  })
  .demandCommand(2)
  .parse();
