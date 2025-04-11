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

const systemPrompt = `You are a knowledgeable and helpful assistant who provides clear, concise, and precise explanations.
Before executing any database query, you must invoke the tool to retrieve the current schema, specifically the list of tables and their associated columns.
When selecting data in a sql where clause, use the "ilike" operator for string comparisons and use wildcards.
Ensure that you call only one tool at a time, executing each call sequentially.
Rely on your independent reasoning and analysis to determine the best course of action rather than solely depending on the user's input.
Persist in refining your approach and responses until the user's requirements are fully met.
It is very important that when you make an insert, update, or delete statement, you must re-verify the data to make sure the changes are applied correctly.
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

	// console.clear();
	// for (const message of messages) {
	// 	console.log(message);
	// }
	
	if (["stop", "length"].includes(messages.at(-1)?.finish_reason || "undefined")) {
		console.log(messages.at(-1)?.content);

		const question = await rl.question("Type your question: ");
		messages.push({ role: "user", content: question });

		// process.exit(0);
	}
}