import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { OpenAiClient } from "@/clients/OpenAiClient";
import OpenAI from "openai";

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



const result = await openAiClient.completion([
	{ role: "system", content: "You are a helpful assistant that explains things to the user in a precise and simple manner." },
	{ role: "user", content: "Hello! give me all tables and columns in the database." },
]);

const result2 = await openAiClient.completion(result);

console.log(result2);

// console.log(result2);

// const result = await openAiClient.callTool("add", {
// 	a: 50,
// 	b: 25,
// });
// console.log(result.content[0]?.text);