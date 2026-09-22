import { z } from "zod"
import { DEFAULT_LIMIT, MAX_LIMIT } from "../constants.js"
import { ProjectPathSchema, ResponseFormatSchema } from "../schemas/common.js"
import { formatSourceMatches, searchLocalSource } from "../services/local-source.js"

export const searchLocalSourceInputSchema = {
  project_path: ProjectPathSchema,
  query: z.string().min(2).max(200).describe("Text or identifiers to find in local Medusa project source code."),
  limit: z.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT).describe("Maximum number of matching source lines to return."),
  response_format: ResponseFormatSchema,
}

export async function searchLocalSourceTool({ project_path, query, limit, response_format }: { project_path: string; query: string; limit: number; response_format: "markdown" | "json" }) {
  const matches = await searchLocalSource(project_path, query, limit)
  const output = { project_path, query, count: matches.length, matches }
  return {
    content: [{ type: "text" as const, text: response_format === "json" ? JSON.stringify(output, null, 2) : `# Local Medusa Source Search\n\n${formatSourceMatches(matches)}` }],
    structuredContent: output,
  }
}
