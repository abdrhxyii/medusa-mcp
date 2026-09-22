import { ProjectPathSchema, ResponseFormatSchema } from "../schemas/common.js"
import { formatInspectionMarkdown, inspectProject } from "../services/project-inspector.js"

export const inspectProjectInputSchema = {
  project_path: ProjectPathSchema,
  response_format: ResponseFormatSchema,
}

export async function inspectProjectTool({ project_path, response_format }: { project_path: string; response_format: "markdown" | "json" }) {
  const output = await inspectProject(project_path)
  return {
    content: [{ type: "text" as const, text: response_format === "json" ? JSON.stringify(output, null, 2) : formatInspectionMarkdown(output) }],
    structuredContent: output,
  }
}
