export type BaseTool =  {
	type: "object",
	additionalProperties: boolean,
	schema: string,
	properties: Record<string, unknown>
	required?: Array<string>
}

export class ToolHelper {
	constructor() {}

	static emptyTool = (): BaseTool => ({
		type: "object",
		properties: {},
		additionalProperties: false,
		schema: "",
	});
}