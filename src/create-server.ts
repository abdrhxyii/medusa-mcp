import { McpServer } from "@modelcontextprotocol/server"
import { SERVER_NAME, SERVER_VERSION } from "./constants.js"
import { detectVersionInputSchema, detectVersion } from "./tools/detect-version.js"
import { inspectProjectInputSchema, inspectProjectTool } from "./tools/inspect-project.js"
import { searchDocsInputSchema, searchDocsTool } from "./tools/search-docs.js"
import { searchLocalSourceInputSchema, searchLocalSourceTool } from "./tools/search-local-source.js"
import { identifyNativePatternInputSchema, identifyNativePatternTool } from "./tools/identify-native-pattern.js"
import { validateProjectPatternsInputSchema, validateProjectPatternsTool } from "./tools/validate-project-patterns.js"
import { generatePlanInputSchema, generatePlanTool } from "./tools/generate-plan.js"

export function createMedusaServer(): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      instructions: "This server is strictly read-only. Inspect the project and detect its Medusa version before giving architecture advice. Prefer native Medusa modules, workflows, links, API routes, subscribers, plugins, and admin extensions before suggesting custom abstractions.",
    },
  )

  server.registerTool("medusa_detect_version", { title: "Detect Medusa Version", description: "Read a Medusa project's package.json and report its detected Medusa version and installed @medusajs packages. This tool never changes files or databases.", inputSchema: detectVersionInputSchema, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } }, detectVersion)
  server.registerTool("medusa_inspect_project", { title: "Inspect Medusa Project", description: "Inspect a local Medusa project for package metadata, configuration files, top-level directories, and relevant project files. It does not read environment secrets, execute project code, access databases, or modify files.", inputSchema: inspectProjectInputSchema, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } }, inspectProjectTool)
  server.registerTool("medusa_search_docs", { title: "Search Medusa Documentation", description: "Search the official Medusa documentation catalog and fetch the most relevant source pages. Results include source URLs and page content for verifiable answers. This tool only performs public HTTP GET requests.", inputSchema: searchDocsInputSchema, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true } }, searchDocsTool)
  server.registerTool("medusa_search_local_source", { title: "Search Local Medusa Source", description: "Search a local Medusa project's source files for identifiers, APIs, modules, workflows, or patterns. It excludes node_modules, build output, secrets, and Git metadata, and never modifies files.", inputSchema: searchLocalSourceInputSchema, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } }, searchLocalSourceTool)
  server.registerTool("medusa_identify_native_pattern", { title: "Identify Native Medusa Pattern", description: "Map a requirement to the most appropriate native Medusa extension pattern, such as a module, module link, workflow, API route, subscriber, scheduled job, provider module, plugin, or admin extension. This tool gives architecture guidance only and does not generate or modify code.", inputSchema: identifyNativePatternInputSchema, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } }, identifyNativePatternTool)
  server.registerTool("medusa_validate_project_patterns", { title: "Validate Medusa Project Patterns", description: "Run conservative, read-only static checks for architecture indicators such as direct database operations in API routes and scattered environment access. Findings are indicators for review, not automatic proof of a defect.", inputSchema: validateProjectPatternsInputSchema, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } }, validateProjectPatternsTool)
  server.registerTool("medusa_generate_implementation_plan", { title: "Generate Medusa Implementation Plan", description: "Create a read-only, native-first implementation plan for a Medusa requirement. It does not generate code, edit files, run migrations, or change databases.", inputSchema: generatePlanInputSchema, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } }, generatePlanTool)

  return server
}
