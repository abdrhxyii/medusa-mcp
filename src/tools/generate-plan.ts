import { z } from "zod"
import { ProjectPathSchema, ResponseFormatSchema } from "../schemas/common.js"
import { formatImplementationPlanMarkdown, generateImplementationPlan } from "../services/implementation-plan.js"

export const generatePlanInputSchema = {
  project_path: ProjectPathSchema,
  requirement: z.string().min(10).max(1_000).describe("Requirement to turn into a native Medusa implementation plan. The tool does not generate or modify code."),
  response_format: ResponseFormatSchema,
}

export async function generatePlanTool({ project_path, requirement, response_format }: { project_path: string; requirement: string; response_format: "markdown" | "json" }) {
  const output = await generateImplementationPlan(requirement, project_path)
  return { content: [{ type: "text" as const, text: response_format === "json" ? JSON.stringify(output, null, 2) : formatImplementationPlanMarkdown(output) }], structuredContent: output }
}
