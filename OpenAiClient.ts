import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { type BaseClient } from "./client.type";
import { type FunctionTool } from "openai/resources/responses/responses.mjs";
import { type Tool } from "@modelcontextprotocol/sdk/types.js";
import type OpenAI from "openai";

export class OpenAiClient implements BaseClient {
	client: Client;
	transport: StdioClientTransport;
	provider: OpenAI;

	tools: FunctionTool[];

	constructor({
		client,
		transport,
		provider,
	}: {
		client: Client;
		transport: StdioClientTransport;
		provider: OpenAI;
	}) {
		this.client = client;
		this.transport = transport;
		this.provider = provider;

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