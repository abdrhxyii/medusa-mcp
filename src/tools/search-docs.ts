import { z } from "zod"
import { DEFAULT_LIMIT, MAX_LIMIT } from "../constants.js"
import { ResponseFormatSchema } from "../schemas/common.js"
import { formatDocumentationMarkdown, searchDocumentation } from "../services/docs-search.js"

export const searchDocsInputSchema = {
  query: z.string().min(2).max(200).describe("Medusa concept, API, module, workflow, configuration, or error to search for."),
  limit: z.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT).describe("Maximum number of official documentation pages to return."),
  response_format: ResponseFormatSchema,
}

export async function searchDocsTool({ query, limit, response_format }: { query: string; limit: number; response_format: "markdown" | "json" }) {
  const results = await searchDocumentation(query, limit)
  const output = {
    query,
    count: results.length,
    results: results.map(({ title, url, relevance, content }) => ({ title, url, relevance, content })),
  }

  return {
    content: [{ type: "text" as const, text: response_format === "json" ? JSON.stringify(output, null, 2) : formatDocumentationMarkdown(query, results) }],
    structuredContent: output,
  }
}
