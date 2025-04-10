import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { OpenAiClient } from "@/clients/OpenAiClient";
import OpenAI from "openai";
import type { BaseMessage } from "@/types/type";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const transport = new StdioClientTransport({
	command: "bun",
	args: ["/home/rizki/Code/mcp/apps/postgres/server.ts"]
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

let attempt = 1;

let messages: BaseMessage[] = [
	{ role: "system", content: "You are a helpful assistant that explains things to the user in a precise and simple manner." },
	{ role: "user", content: "Hello! give me all tables and columns in the database." },
];

while (attempt <= 10) {
	const result = await openAiClient.completion(messages);
	messages = result;

	attempt++;

	if (messages.at(-1)?.finish_reason == "stop") {
		console.log(messages);
		console.log(`Exited at attempt #${attempt}`);
		process.exit(0);
	}
}