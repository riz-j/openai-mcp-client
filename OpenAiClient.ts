import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { type BaseClient } from "./client.type";
import { type Tool } from "@modelcontextprotocol/sdk/types.js";
import type OpenAI from "openai";
import { type ChatCompletionMessageParam, type ChatCompletionTool } from "openai/resources.mjs";

export class OpenAiClient implements BaseClient {
	client: Client;
	transport: StdioClientTransport;
	provider: OpenAI;

	tools: ChatCompletionTool[];

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
			function: {
				name: tool.name,
				description: tool.description,
				parameters: tool.inputSchema,
				strict: true,
			},
			type: "function",
		}));
	}

	async completion<ChatCompletionMessageParam>(messages: Array<ChatCompletionMessageParam>): Promise<Array<ChatCompletionMessageParam>> {
		return []
	}
}