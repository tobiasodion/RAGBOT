import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { indexDocuments } from "./indexer.js";
import { askQuestion } from "./chatbot_rag.js";

yargs(hideBin(process.argv))
  .command({
    command: "start",
    describe: "Start the chatbot",
    handler: async () => {
      console.log("Initializing the NIS chatbot...");
      const vectorStore = await indexDocuments();
      console.log(
        'Welcome to the NIS chatbot! Type your questions or type "q" to quit.'
      );
      askQuestion(vectorStore);
    },
  })
  .demandCommand(1)
  .parse();
