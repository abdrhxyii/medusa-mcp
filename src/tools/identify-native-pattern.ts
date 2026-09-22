import { z } from "zod"
import { ProjectPathSchema, ResponseFormatSchema } from "../schemas/common.js"
import { formatNativePatternMarkdown, identifyNativePattern } from "../services/native-patterns.js"

export const identifyNativePatternInputSchema = {
  project_path: ProjectPathSchema,
  requirement: z.string().min(10).max(1_000).describe("Business or technical requirement to map to a native Medusa architecture pattern."),
  response_format: ResponseFormatSchema,
}

export async function identifyNativePatternTool({ project_path, requirement, response_format }: { project_path: string; requirement: string; response_format: "markdown" | "json" }) {
  const output = await identifyNativePattern(requirement, project_path)
  return { content: [{ type: "text" as const, text: response_format === "json" ? JSON.stringify(output, null, 2) : formatNativePatternMarkdown(output) }], structuredContent: output }
}
