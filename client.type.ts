import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { ChatCompletionTool } from "openai/resources.mjs";
// import { type FunctionTool } from "openai/resources/responses/responses.mjs";

export type AbstractClient = ChatCompletionTool;

export interface BaseClient {
	client: Client;
	transport: StdioClientTransport;
	tools: AbstractClient[];
	connect(): Promise<void>;
}