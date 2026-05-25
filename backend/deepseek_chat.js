const { AzureKeyCredential } = require("@azure/core-auth");
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function main() {
  const { default: ModelClient, isUnexpected } = await import("@azure-rest/ai-inference");
  
  const token = process.env["GITHUB_TOKEN"];
  if (!token) {
      console.error("❌ ERROR: GITHUB_TOKEN is not defined in your .env file.");
      return;
  }

  const endpoint = "https://models.github.ai/inference";
  
  const AVAILABLE_MODELS = {
    '1': { name: "DeepSeek-V3", id: "deepseek/DeepSeek-V3-0324" },
    '2': { name: "Grok-3", id: "xai/grok-3" },
    '3': { name: "GPT-4.1", id: "openai/gpt-4.1" }
  };

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("\n--- Model Selection ---");
  Object.keys(AVAILABLE_MODELS).forEach(key => {
    console.log(`${key}. ${AVAILABLE_MODELS[key].name} (${AVAILABLE_MODELS[key].id})`);
  });

  rl.question('\nSelect a model (1, 2, or 3): ', async (choice) => {
    const selected = AVAILABLE_MODELS[choice] || AVAILABLE_MODELS['1'];
    const modelId = selected.id;

    console.log(`\n🚀 Starting Interactive Chat with \x1b[33m${selected.name}\x1b[0m`);
    console.log(`Type 'exit' to quit.\n`);

    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token),
    );

    const chatHistory = [
      { role: "system", content: "You are a helpful assistant for Tunisia Transformateurs (TTF). Respond in French by default." }
    ];

    const askQuestion = () => {
      rl.question('\x1b[36mYou: \x1b[0m', async (input) => {
        if (input.toLowerCase().trim() === 'exit') {
          console.log("Au revoir !");
          rl.close();
          return;
        }

        chatHistory.push({ role: "user", content: input });

        try {
          process.stdout.write(`\x1b[2m${selected.name} is thinking...\x1b[0m`);
          
          const response = await client.path("/chat/completions").post({
            body: {
              messages: chatHistory,
              model: modelId,
              temperature: 0.7,
              max_tokens: 2000
            }
          });

          // Clear the "thinking..." line
          readline.clearLine(process.stdout, 0);
          readline.cursorTo(process.stdout, 0);

          if (isUnexpected(response)) {
              console.error(`\n❌ API Error - Status: ${response.status}`);
              const errorMsg = response.body?.error?.message || "Unknown error";
              console.error(`Message: ${errorMsg}`);
              // Remove the failed message from history
              chatHistory.pop();
          } else {
              const reply = response.body.choices[0].message.content;
              console.log(`\x1b[32m${selected.name}:\x1b[0m ${reply}\n`);
              chatHistory.push({ role: "assistant", content: reply });
          }

        } catch (err) {
          readline.clearLine(process.stdout, 0);
          readline.cursorTo(process.stdout, 0);
          console.error("\n❌ Error encountered:", err.message);
          chatHistory.pop();
        }

        askQuestion();
      });
    };

    askQuestion();
  });
}

main();
