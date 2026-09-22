import { readFile } from "node:fs/promises"
import { basename, extname, relative, resolve } from "node:path"
import fg from "fast-glob"
import { MAX_TEXT_LENGTH } from "../constants.js"

export interface SourceMatch {
  file: string
  line: number
  text: string
}

const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"])

function tokens(query: string): string[] {
  return query.toLowerCase().split(/[^a-z0-9_@$.-]+/).filter((token) => token.length > 1)
}

export async function searchLocalSource(projectPath: string, query: string, limit: number): Promise<SourceMatch[]> {
  const root = resolve(projectPath)
  const files = await fg(["**/*"], {
    cwd: root,
    onlyFiles: true,
    absolute: true,
    dot: false,
    ignore: ["**/node_modules/**", "**/.git/**", "**/.next/**", "**/dist/**", "**/coverage/**"],
  })
  const wanted = tokens(query)
  const matches: SourceMatch[] = []

  for (const file of files) {
    if (!TEXT_EXTENSIONS.has(extname(file).toLowerCase())) continue
    const source = await readFile(file, "utf8").catch(() => "")
    if (!source || source.length > MAX_TEXT_LENGTH * 4) continue

    const lines = source.split(/\r?\n/)
    lines.forEach((text, index) => {
      const lower = text.toLowerCase()
      if (wanted.every((token) => lower.includes(token))) {
        matches.push({ file: relative(root, file), line: index + 1, text: text.trim().slice(0, 500) })
      }
    })
  }

  return matches.slice(0, limit)
}

export function formatSourceMatches(matches: SourceMatch[]): string {
  if (!matches.length) return "No matching source lines were found in the project."
  return matches.map((match) => `- \`${match.file}:${match.line}\` — ${match.text}`).join("\n")
}

export async function collectSourceFiles(projectPath: string): Promise<string[]> {
  const root = resolve(projectPath)
  const files = await fg(["**/*"], {
    cwd: root,
    onlyFiles: true,
    absolute: true,
    dot: false,
    ignore: ["**/node_modules/**", "**/.git/**", "**/.next/**", "**/dist/**", "**/coverage/**"],
  })
  return files.filter((file) => TEXT_EXTENSIONS.has(extname(file).toLowerCase())).map((file) => relative(root, file))
}

export function isLikelyApiFile(file: string): boolean {
  return file.replaceAll("\\", "/").includes("/api/") || file.replaceAll("\\", "/").startsWith("api/")
}

export function isLikelyRouteFile(file: string): boolean {
  return ["route.ts", "route.tsx", "route.js", "route.mjs"].includes(basename(file))
}
