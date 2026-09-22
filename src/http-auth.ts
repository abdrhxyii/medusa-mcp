export function isAuthorized(request: Request): boolean {
  const expectedToken = process.env.MEDUSA_MCP_TOKEN
  if (!expectedToken) return false
  return request.headers.get("authorization") === `Bearer ${expectedToken}`
}

export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json", "www-authenticate": "Bearer" } })
}
