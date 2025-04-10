import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources.mjs";
// import { type FunctionTool } from "openai/resources/responses/responses.mjs";

export type AbstractTool = ChatCompletionTool;

export interface BaseClient {
	client: Client;
	transport: StdioClientTransport;
	tools: Array<AbstractTool>;
	connect(): Promise<void>;
	completion<T extends ChatCompletionMessageParam>(messages: Array<T>): Promise<Array<T>>;
}