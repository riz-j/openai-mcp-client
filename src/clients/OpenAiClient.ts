import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { type BaseClient, type BaseMessage, type ToolCallResult } from "@/types/type";
import { type Tool } from "@modelcontextprotocol/sdk/types.js";
import type OpenAI from "openai";
import type { ChatCompletion, ChatCompletionTool } from "openai/resources.mjs";
import { ToolHelper } from "@/tools/ToolHelper";

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
				parameters: tool.inputSchema.properties
					? tool.inputSchema
					: ToolHelper.emptyTool(),
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

		const choice: ChatCompletion.Choice = completion.choices[0];

		const newMessage: BaseMessage = {
			role: choice.message.role,
			content: choice.message.content || "[empty]",
			finish_reason: choice.finish_reason,
		}

		if (!choice.message.tool_calls) {
			return [...messages, newMessage];
		}

		const toolName: string = choice.message.tool_calls[0]?.function.name || "";
		const toolParams: Record<string, unknown> = JSON.parse(choice.message.tool_calls[0]?.function.arguments) || {};
		
		const toolAlert: BaseMessage = {
			role: "assistant",
			content: `Calling tool "${toolName}" with arguments: ${JSON.stringify(toolParams)}`,
			finish_reason: choice.finish_reason,
		}

		const toolResult: BaseMessage = {
			role: "assistant",
			content: JSON.stringify({
				tool_call_result: await this.callToolAsString(toolName, toolParams)
			}),
			finish_reason: choice.finish_reason,
			tool_call: {
				tool_name: toolName,
				tool_arguments: toolParams,
			},
		}

		return [...messages, newMessage, toolAlert, toolResult];
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

	async callToolAsString(
		tool_name: string,
		params: Record<string, unknown> | null
	): Promise<string> {
		const result = await this.client.callTool({
			name: tool_name,
			arguments: params || {},
		}) as ToolCallResult;

		return result.content[0]?.text || "[empty]";
	}
}