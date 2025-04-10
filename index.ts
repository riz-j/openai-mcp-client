import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { OpenAiClient } from "@/clients/OpenAiClient";
import OpenAI from "openai";
import type { BaseMessage } from "@/types/type";
import readline from 'readline/promises';

if (!process.env.OPENAI_API_KEY) {
	console.error("OPENAI_API_KEY is not set");
	process.exit(1);
}

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

const systemPrompt = `You are a helpful assistant that explains things to the user in a precise and simple manner.
Prior to executing any database queries, you will call the tool to get the tables and columns of the database.
`;

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

let messages: BaseMessage[] = [
	{ role: "system", content: systemPrompt },
];

const question = await rl.question("Type your question: ");

while (true) {
	if (messages.length <= 1) {
		messages.push({ role: "user", content: question });
	}

	messages = await openAiClient.completion(messages);

	console.clear();
	for (const message of messages) {
		console.log(message);
	}
	
	if (["stop", "length"].includes(messages.at(-1)?.finish_reason || "undefined")) {
		const question = await rl.question("Type your question: ");
		messages.push({ role: "user", content: question });

		// console.log(messages.at(-1)?.content)
		// process.exit(0);
	}
}