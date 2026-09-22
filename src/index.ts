import { StdioServerTransport } from "@modelcontextprotocol/server/stdio"
import { SERVER_NAME, SERVER_VERSION } from "./constants.js"
import { createMedusaServer } from "./create-server.js"

async function main(): Promise<void> {
  await createMedusaServer().connect(new StdioServerTransport())
  console.error(`${SERVER_NAME} ${SERVER_VERSION} started over stdio`)
}

main().catch((error: unknown) => {
  console.error("Medusa MCP failed to start:", error instanceof Error ? error.message : error)
  process.exitCode = 1
})
