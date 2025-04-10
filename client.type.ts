import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { type FunctionTool } from "openai/resources/responses/responses.mjs";

export type BaseTool = FunctionTool;

export interface BaseClient {
	client: Client;
	transport: StdioClientTransport;
	tools: BaseTool[];
	connect(): Promise<void>;
}