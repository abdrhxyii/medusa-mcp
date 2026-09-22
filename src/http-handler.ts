import { createMcpHandler } from "@modelcontextprotocol/server"
import { createMedusaServer } from "./create-server.js"
import { isAuthorized, unauthorizedResponse } from "./http-auth.js"

const mcpHandler = createMcpHandler(() => createMedusaServer(), {
  legacy: "stateless",
  responseMode: "json",
  onerror: (error) => console.error("MCP HTTP error:", error.message),
})

export async function handleMcpRequest(request: Request): Promise<Response> {
  if (!isAuthorized(request)) return unauthorizedResponse()
  return mcpHandler.fetch(request)
}
