import { McpServer } from "@modelcontextprotocol/server"
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio"
import { SERVER_NAME, SERVER_VERSION } from "./constants.js"
import { detectVersionInputSchema, detectVersion } from "./tools/detect-version.js"
import { inspectProjectInputSchema, inspectProjectTool } from "./tools/inspect-project.js"
import { searchDocsInputSchema, searchDocsTool } from "./tools/search-docs.js"

const server = new McpServer(
  { name: SERVER_NAME, version: SERVER_VERSION },
  {
    instructions:
      "This server is strictly read-only. Inspect the project and detect its Medusa version before giving architecture advice. Prefer native Medusa modules, workflows, links, API routes, subscribers, plugins, and admin extensions before suggesting custom abstractions.",
  },
)

server.registerTool(
  "medusa_detect_version",
  {
    title: "Detect Medusa Version",
    description: "Read a Medusa project's package.json and report its detected Medusa version and installed @medusajs packages. This tool never changes files or databases.",
    inputSchema: detectVersionInputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  detectVersion,
)

server.registerTool(
  "medusa_inspect_project",
  {
    title: "Inspect Medusa Project",
    description: "Inspect a local Medusa project for package metadata, configuration files, top-level directories, and relevant project files. It does not read environment secrets, execute project code, access databases, or modify files.",
    inputSchema: inspectProjectInputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  inspectProjectTool,
)

server.registerTool(
  "medusa_search_docs",
  {
    title: "Search Medusa Documentation",
    description: "Search the official Medusa documentation catalog and fetch the most relevant source pages. Results include source URLs and page content for verifiable answers. This tool only performs public HTTP GET requests.",
    inputSchema: searchDocsInputSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  searchDocsTool,
)

async function main(): Promise<void> {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error(`${SERVER_NAME} ${SERVER_VERSION} started over stdio`)
}

main().catch((error: unknown) => {
  console.error("Medusa MCP failed to start:", error instanceof Error ? error.message : error)
  process.exitCode = 1
})
