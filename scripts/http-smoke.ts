import { handleMcpRequest } from "../src/http-handler.js"

process.env.MEDUSA_MCP_TOKEN = "smoke-token"

const unauthorized = await handleMcpRequest(new Request("https://example.test/mcp", { method: "POST", body: "{}" }))
if (unauthorized.status !== 401) throw new Error(`Expected unauthorized response, received ${unauthorized.status}`)

const initialize = await handleMcpRequest(new Request("https://example.test/mcp", {
  method: "POST",
  headers: { authorization: "Bearer smoke-token", "content-type": "application/json", accept: "application/json, text/event-stream" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "smoke", version: "0.1.0" } } }),
}))

if (!initialize.ok) throw new Error(`Expected MCP initialization to succeed, received ${initialize.status}: ${await initialize.text()}`)
console.log(JSON.stringify({ unauthorizedStatus: unauthorized.status, initializeStatus: initialize.status, initializeContentType: initialize.headers.get("content-type") }, null, 2))
