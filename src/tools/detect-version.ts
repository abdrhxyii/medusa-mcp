import { ProjectPathSchema, ResponseFormatSchema } from "../schemas/common.js"
import { formatInspectionMarkdown, inspectProject } from "../services/project-inspector.js"

export const detectVersionInputSchema = {
  project_path: ProjectPathSchema,
  response_format: ResponseFormatSchema,
}

export async function detectVersion({ project_path, response_format }: { project_path: string; response_format: "markdown" | "json" }) {
  const inspection = await inspectProject(project_path)
  const output = {
    project_path: inspection.projectPath,
    package_name: inspection.packageName,
    medusa_version: inspection.medusaVersion,
    medusa_packages: inspection.medusaPackages,
  }

  return {
    content: [{ type: "text" as const, text: response_format === "json" ? JSON.stringify(output, null, 2) : formatInspectionMarkdown(inspection) }],
    structuredContent: output,
  }
}
