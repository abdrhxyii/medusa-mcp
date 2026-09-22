import { MEDUSA_LLM_INDEX_URL, MAX_TEXT_LENGTH } from "../constants.js"
import type { DocumentationEntry, DocumentationResult } from "../types.js"

let catalogPromise: Promise<DocumentationEntry[]> | undefined

function parseCatalog(markdown: string): DocumentationEntry[] {
  const entries: DocumentationEntry[] = []
  const linkPattern = /- \[([^\]]+)\]\((https:\/\/docs\.medusajs\.com\/[^)]+)\)/g

  for (const match of markdown.matchAll(linkPattern)) {
    const [, title, url] = match
    if (title && url) entries.push({ title, url })
  }

  return [...new Map(entries.map((entry) => [entry.url, entry])).values()]
}

async function loadCatalog(): Promise<DocumentationEntry[]> {
  const response = await fetch(MEDUSA_LLM_INDEX_URL)
  if (!response.ok) throw new Error(`Medusa documentation index request failed with HTTP ${response.status}.`)
  return parseCatalog(await response.text())
}

function tokenize(query: string): string[] {
  return query.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 1)
}

function scoreEntry(entry: DocumentationEntry, tokens: string[]): number {
  const title = entry.title.toLowerCase()
  const url = entry.url.toLowerCase()
  return tokens.reduce((score, token) => score + (title.includes(token) ? 5 : 0) + (url.includes(token) ? 2 : 0), 0)
}

async function fetchPage(entry: DocumentationEntry, relevance: number): Promise<DocumentationResult> {
  const response = await fetch(entry.url)
  if (!response.ok) {
    return { ...entry, relevance, content: `Unable to fetch this page at request time (HTTP ${response.status}).` }
  }

  const content = (await response.text()).slice(0, MAX_TEXT_LENGTH)
  return { ...entry, relevance, content }
}

export async function searchDocumentation(query: string, limit: number): Promise<DocumentationResult[]> {
  catalogPromise ??= loadCatalog()
  const catalog = await catalogPromise
  const tokens = tokenize(query)
  const candidates = catalog
    .map((entry) => ({ entry, relevance: scoreEntry(entry, tokens) }))
    .filter(({ relevance }) => relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit)

  if (!candidates.length) return []
  return Promise.all(candidates.map(({ entry, relevance }) => fetchPage(entry, relevance)))
}

export function formatDocumentationMarkdown(query: string, results: DocumentationResult[]): string {
  if (!results.length) return `No official Medusa documentation pages matched \`${query}\`.`

  return [
    `# Medusa Documentation Results for \`${query}\``,
    "",
    ...results.flatMap((result, index) => [
      `## ${index + 1}. ${result.title}`,
      `Source: ${result.url}`,
      `Relevance score: ${result.relevance}`,
      "",
      result.content,
      "",
    ]),
  ].join("\n")
}
