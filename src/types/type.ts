import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { ChatCompletionTool } from "openai/resources.mjs";

export interface ToolCall {
	tool_name: string;
	tool_arguments: Record<string, unknown>;
}

export interface ToolCallResult {
	content: Array<{
		type: "text";
		text: string;
	}>;
}

export interface BaseMessage {
	role: "system" | "user" | "assistant";
	content: string;
	tool_call?: ToolCall;
}

export type AbstractTool = ChatCompletionTool;

export interface BaseClient {
	client: Client;
	transport: StdioClientTransport;
	tools: Array<AbstractTool>;
	connect(): Promise<void>;
	completion(messages: Array<BaseMessage>): Promise<Array<BaseMessage>>;
}