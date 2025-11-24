import { GoogleGenAI } from "@google/genai";
import * as readline from "readline";
import { config } from "dotenv";

config();

// Available Gemini models
const MODELS = {
  "1": { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
  "2": { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite" },
  "3": { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
  "4": { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
  "5": { id: "gemini-2.5-pro-preview-05-06", name: "Gemini 2.5 Pro (Preview)" },
  "6": { id: "gemini-2.5-flash-preview-05-20", name: "Gemini 2.5 Flash (Preview)" },
};

// Initialize the client
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// Current model and chat history
let currentModel = MODELS["1"].id;
let chatHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function showHelp() {
  console.log(`
Commands:
  /models     - Show available models
  /switch <n> - Switch to model number n
  /clear      - Clear chat history
  /stream     - Toggle streaming mode
  /help       - Show this help
  /exit       - Exit the program

Current model: ${currentModel}
`);
}

function showModels() {
  console.log("\nAvailable models:");
  for (const [key, model] of Object.entries(MODELS)) {
    const marker = model.id === currentModel ? " (current)" : "";
    console.log(`  ${key}. ${model.name}${marker}`);
  }
  console.log("\nUse /switch <number> to change model\n");
}

async function chat(userMessage: string, useStream: boolean = false) {
  // Add user message to history
  chatHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  try {
    if (useStream) {
      // Streaming response
      const response = await ai.models.generateContentStream({
        model: currentModel,
        contents: chatHistory,
      });

      let fullText = "";
      process.stdout.write("\nAssistant: ");

      for await (const chunk of response) {
        const text = chunk.text || "";
        process.stdout.write(text);
        fullText += text;
      }
      console.log("\n");

      // Add assistant response to history
      chatHistory.push({
        role: "model",
        parts: [{ text: fullText }],
      });
    } else {
      // Non-streaming response
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: chatHistory,
      });

      const text = response.text || "";
      console.log(`\nAssistant: ${text}\n`);

      // Add assistant response to history
      chatHistory.push({
        role: "model",
        parts: [{ text }],
      });
    }
  } catch (error: any) {
    console.error(`\nError: ${error.message}\n`);
    // Remove the failed user message from history
    chatHistory.pop();
  }
}

async function main() {
  console.log("=================================");
  console.log("   Gemini AI Chat Application");
  console.log("=================================");
  console.log(`Current model: ${currentModel}`);
  console.log("Type /help for commands\n");

  let useStream = false;

  while (true) {
    const input = await prompt("You: ");
    const trimmedInput = input.trim();

    if (!trimmedInput) continue;

    // Handle commands
    if (trimmedInput.startsWith("/")) {
      const [cmd, ...args] = trimmedInput.split(" ");

      switch (cmd.toLowerCase()) {
        case "/exit":
        case "/quit":
          console.log("Goodbye!");
          rl.close();
          process.exit(0);
          break;

        case "/help":
          showHelp();
          break;

        case "/models":
          showModels();
          break;

        case "/switch":
          const modelNum = args[0];
          if (modelNum && MODELS[modelNum as keyof typeof MODELS]) {
            currentModel = MODELS[modelNum as keyof typeof MODELS].id;
            chatHistory = []; // Clear history when switching models
            console.log(`\nSwitched to ${currentModel}\nChat history cleared.\n`);
          } else {
            console.log("\nInvalid model number. Use /models to see available options.\n");
          }
          break;

        case "/clear":
          chatHistory = [];
          console.log("\nChat history cleared.\n");
          break;

        case "/stream":
          useStream = !useStream;
          console.log(`\nStreaming mode: ${useStream ? "ON" : "OFF"}\n`);
          break;

        default:
          console.log("\nUnknown command. Type /help for available commands.\n");
      }
    } else {
      // Regular chat message
      await chat(trimmedInput, useStream);
    }
  }
}

main().catch(console.error);
