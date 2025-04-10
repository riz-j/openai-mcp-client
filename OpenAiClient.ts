import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { type BaseClient } from "./client.type";
import { type FunctionTool } from "openai/resources/responses/responses.mjs";
import { type Tool } from "@modelcontextprotocol/sdk/types.js";

export class OpenAiClient implements BaseClient {
	client: Client;
	transport: StdioClientTransport;

	tools: FunctionTool[];

	constructor({
		client,
		transport,
	}: {
		client: Client;
		transport: StdioClientTransport;
	}) {
		this.client = client;
		this.transport = transport;

		this.tools = [];
	}

	async connect() {
		await this.client.connect(this.transport);

		const toolsResult = await this.client.listTools();

		this.tools = toolsResult.tools.map((tool: Tool) => ({
			name: tool.name,
			parameters: tool.inputSchema,
			strict: true,
			type: "function",
		}));
	}
}