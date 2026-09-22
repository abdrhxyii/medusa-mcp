import { z } from "zod"
import { DEFAULT_LIMIT, MAX_LIMIT } from "../constants.js"
import { ProjectPathSchema, ResponseFormatSchema } from "../schemas/common.js"
import { formatPatternFindingsMarkdown, validateProjectPatterns } from "../services/pattern-validator.js"

export const validateProjectPatternsInputSchema = {
  project_path: ProjectPathSchema,
  limit: z.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT).describe("Maximum number of static architecture findings to return."),
  response_format: ResponseFormatSchema,
}

export async function validateProjectPatternsTool({ project_path, limit, response_format }: { project_path: string; limit: number; response_format: "markdown" | "json" }) {
  const findings = await validateProjectPatterns(project_path, limit)
  const output = { project_path, count: findings.length, findings }
  return { content: [{ type: "text" as const, text: response_format === "json" ? JSON.stringify(output, null, 2) : `# Medusa Pattern Validation\n\n${formatPatternFindingsMarkdown(findings)}` }], structuredContent: output }
}
