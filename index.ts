import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { OpenAiClient } from "./OpenAiClient";

const transport = new StdioClientTransport({
  command: "bun",
  args: ["/home/rizki/Code/mcp/apps/postgres/server.ts"]
});

const client = new Client({
  name: "openai-mcp-client",
  version: "0.0.1"
});

const openAiClient = new OpenAiClient({
  client,
  transport,
});

await openAiClient.connect();

console.log(openAiClient.tools);