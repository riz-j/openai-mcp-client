import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { type BaseClient, type BaseMessage, type ToolCallResult } from "@/types/type";
import { type Tool } from "@modelcontextprotocol/sdk/types.js";
import type OpenAI from "openai";
import type { ChatCompletion, ChatCompletionTool } from "openai/resources.mjs";

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

	async completion(
		messages: Array<BaseMessage>
	): Promise<Array<BaseMessage>> {
		const completion: ChatCompletion = await this.provider.chat.completions.create({
			model: "gpt-4o-mini",
			messages,
			tools: this.tools,
		});

		const choice = completion.choices[0];

		const baseMessage: BaseMessage = {
			role: choice.message.role,
			content: choice.message.content || "[empty]",
		}

		if (choice.message.tool_calls) {
			baseMessage.tool_call = {
				tool_name: choice.message.tool_calls[0]?.function.name || "",
				tool_arguments: JSON.parse(choice.message.tool_calls[0]?.function.arguments) || {},
			}
		}

		return [...messages, baseMessage];
	}

	async callTool(
		tool_name: string,
		params: Record<string, unknown> | null
	): Promise<ToolCallResult> {
		const result = await this.client.callTool({
			name: tool_name,
			arguments: params || {},
		});

		return result as ToolCallResult;
	}
}