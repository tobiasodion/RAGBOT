import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const askQuestion = (chain) => {
  try {
    rl.question("Ask your question: ", async (question) => {
      if (question.toLowerCase() === "q") {
        console.log("Thank you for using the RAGBOT. Goodbye!");
        rl.close();
      } else {
        const answer = await answerQuestion(chain, question);
        console.log(`Response: ${answer}`);
        askQuestion(chain);
      }
    });
  } catch (e) {
    console.log(e);
    console.log("An error occured while responding to your question");
  }
};

const answerQuestion = async (chain, question) => {
  try {
    const result = await chain.invoke({
      input: question,
    });

    return result.answer ?? result;
  } catch (e) {
    console.log(e);
    console.log("An error occured while getting response from LLM");
  }
};
