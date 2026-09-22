import { readFile } from "node:fs/promises"
import { isLikelyApiFile, isLikelyRouteFile, collectSourceFiles } from "./local-source.js"
import { resolve } from "node:path"

export interface PatternFinding {
  severity: "warning" | "info"
  rule: string
  file: string
  line: number
  evidence: string
  recommendation: string
}

const DIRECT_DATABASE_IMPORT = /from\s+["'](?:@mikro-orm|knex|@prisma|prisma|sequelize|pg|drizzle-orm)/
const RAW_DATABASE_OPERATION = /\b(?:SELECT|INSERT|UPDATE|DELETE)\b|\.raw\(|\.query\(/i
const SECRET_ACCESS = /process\.env\.(?!NODE_ENV|PORT|DATABASE_URL)/

export async function validateProjectPatterns(projectPath: string, maxFindings: number): Promise<PatternFinding[]> {
  const root = resolve(projectPath)
  const findings: PatternFinding[] = []
  const files = await collectSourceFiles(root)

  for (const file of files) {
    if (findings.length >= maxFindings) break
    const source = await readFile(resolve(root, file), "utf8").catch(() => "")
    if (!source) continue
    const lines = source.split(/\r?\n/)

    lines.forEach((text, index) => {
      if (findings.length >= maxFindings) return
      if (isLikelyApiFile(file) && isLikelyRouteFile(file) && DIRECT_DATABASE_IMPORT.test(text)) {
        findings.push({ severity: "warning", rule: "database-access-in-api-route", file, line: index + 1, evidence: text.trim().slice(0, 300), recommendation: "Move persistence behind a Medusa module service and invoke it through a workflow or route-level orchestration." })
      } else if (isLikelyApiFile(file) && isLikelyRouteFile(file) && RAW_DATABASE_OPERATION.test(text)) {
        findings.push({ severity: "warning", rule: "raw-database-operation-in-api-route", file, line: index + 1, evidence: text.trim().slice(0, 300), recommendation: "Check whether the operation belongs in a Commerce Module, custom module service, or workflow instead of the API handler." })
      } else if (SECRET_ACCESS.test(text) && !file.includes("config") && !file.includes("environment")) {
        findings.push({ severity: "info", rule: "environment-access-outside-configuration", file, line: index + 1, evidence: text.trim().slice(0, 300), recommendation: "Keep provider and infrastructure configuration centralized and avoid exposing secrets through route responses or business-domain objects." })
      }
    })
  }

  return findings
}

export function formatPatternFindingsMarkdown(findings: PatternFinding[]): string {
  if (!findings.length) return "No known Medusa architecture indicators were found by the read-only static checks."
  return findings.map((finding) => [`### ${finding.severity.toUpperCase()}: ${finding.rule}`, `- **Location:** \`${finding.file}:${finding.line}\``, `- **Evidence:** \`${finding.evidence}\``, `- **Recommendation:** ${finding.recommendation}`, ""].join("\n")).join("\n")
}
