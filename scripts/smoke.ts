import { Client } from "@modelcontextprotocol/client"
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio"

const client = new Client({ name: "medusa-mcp-smoke-test", version: "0.1.0" })
const transport = new StdioClientTransport({
  command: "bun",
  args: ["run", "src/index.ts"],
  cwd: process.cwd(),
  stderr: "pipe",
})

await client.connect(transport)
const { tools } = await client.listTools()
const toolNames = tools.map((tool) => tool.name).sort()
const expectedTools = [
  "medusa_detect_version",
  "medusa_inspect_project",
  "medusa_search_docs",
  "medusa_search_local_source",
  "medusa_identify_native_pattern",
  "medusa_validate_project_patterns",
  "medusa_generate_implementation_plan",
]

for (const expectedTool of expectedTools) {
  if (!toolNames.includes(expectedTool)) {
    throw new Error(`Missing expected tool: ${expectedTool}`)
  }
}

const inspection = await client.callTool({
  name: "medusa_inspect_project",
  arguments: { project_path: ".", response_format: "json" },
})

if (inspection.isError) throw new Error("medusa_inspect_project returned an MCP error")

const plan = await client.callTool({
  name: "medusa_generate_implementation_plan",
  arguments: {
    project_path: ".",
    requirement: "Attach custom participant data to products and show it in the admin dashboard",
    response_format: "json",
  },
})

if (plan.isError) throw new Error("medusa_generate_implementation_plan returned an MCP error")

console.log(JSON.stringify({ toolNames, inspectionSucceeded: true }, null, 2))
await client.close()
