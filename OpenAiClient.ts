import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { type BaseClient } from "./client.type";
import { type Tool } from "@modelcontextprotocol/sdk/types.js";
import type OpenAI from "openai";
import { type ChatCompletion, type ChatCompletionMessageParam, type ChatCompletionTool } from "openai/resources.mjs";
import type { ToolChoiceFunction } from "openai/resources/responses/responses.mjs";

interface ToolCall {
	tool_name: string;
	tool_arguments: Record<string, unknown>;
}

interface BaseMessage {
	role: "system" | "user" | "assistant";
	content: string;
	tool_call?: ToolCall;
}

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

	async completion(messages: Array<BaseMessage>): Promise<Array<BaseMessage>> {
		const completion: ChatCompletion = await this.provider.chat.completions.create({
			model: "gpt-4o-mini",
			messages,
			tools: this.tools,
		});

		const choice = completion.choices[0];

		const baseMessage: BaseMessage = {
			role: choice.message.role,
			content: choice.message.content || "No Content",
		}

		if (choice.message.tool_calls) {
			baseMessage.tool_call = {
				tool_name: choice.message.tool_calls[0]?.function.name || "",
				tool_arguments: JSON.parse(choice.message.tool_calls[0]?.function.arguments) || {},
			}
		}

		return [...messages, baseMessage];
	}
}