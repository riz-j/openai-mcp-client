import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { OpenAiClient } from "./OpenAiClient";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const transport = new StdioClientTransport({
	command: "bun",
	args: ["/home/rizki/Code/mcp/apps/calculator/server.js"]
});

const client = new Client({
	name: "openai-mcp-client",
	version: "0.0.1"
});

const openAiClient = new OpenAiClient({
	provider: openai,
	client,
	transport,
});

await openAiClient.connect();

// console.log(openAiClient.tools);

const completion = await openai.chat.completions.create({
	model: "gpt-4o-mini",
	messages: [
		{ role: "user", content: "Hello! Add 5 with 25" },
	],
	tools: openAiClient.tools,
	tool_choice: "auto",
});

console.log(JSON.stringify(completion.choices, null, 2));