import type { VercelRequest, VercelResponse } from "@vercel/node"
import { handleMcpRequest } from "../src/http-handler.js"

function toRequest(request: VercelRequest): Request {
  const protocol = request.headers["x-forwarded-proto"] ?? "https"
  const host = request.headers.host ?? "localhost"
  const headers = new Headers()
  for (const [key, value] of Object.entries(request.headers)) {
    if (typeof value === "string") headers.set(key, value)
    else if (Array.isArray(value)) headers.set(key, value.join(", "))
  }
  const method = request.method ?? "POST"
  const body = method === "GET" || method === "HEAD" ? undefined : JSON.stringify(request.body ?? {})
  return new Request(`${protocol}://${host}${request.url ?? "/api/mcp"}`, { method, headers, body })
}

export default async function mcp(request: VercelRequest, response: VercelResponse): Promise<void> {
  const webRequest = toRequest(request)
  const webResponse = await handleMcpRequest(webRequest)
  response.status(webResponse.status)
  webResponse.headers.forEach((value, key) => response.setHeader(key, value))
  response.send(Buffer.from(await webResponse.arrayBuffer()))
}
