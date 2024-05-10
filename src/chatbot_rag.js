import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const askQuestion = (vectorStore) => {
  try {
    rl.question("Ask your question: ", async (question) => {
      if (question.toLowerCase() === "q") {
        console.log("Thank you for using the Website chatbot. Goodbye!");
        rl.close();
      } else {
        const answer = await answerQuestion(vectorStore, question);
        console.log(`Response: ${answer}`);
        askQuestion(vectorStore);
      }
    });
  } catch (e) {
    console.log(e);
    console.log("An error occured while responding to your question");
  }
};

const answerQuestion = async (vectorStore, question) => {
  try {
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

    const retriever = vectorStore.asRetriever();

    const retrievalChain = await createRetrievalChain({
      combineDocsChain: documentChain,
      retriever,
    });

    //query the model
    const result = await retrievalChain.invoke({
      input: question,
    });

    return result.answer;
  } catch (e) {
    console.log(e);
    console("An error occured while getting response from LLM");
  }
};
