import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
	command: "bun",
	args: ["/home/rizki/Code/mcp/apps/postgres/server.ts"]
});

const client = new Client({
	name: "openai-mcp-client",
	version: "0.0.1"
});

await client.connect(transport);

const tools = await client.listTools();
console.log(tools.tools.map(tool => tool.inputSchema));

const result = await client.callTool({
	name: "get-database-tables-and-columns",
	arguments: {
		any: true,
	}
});

console.log(result);