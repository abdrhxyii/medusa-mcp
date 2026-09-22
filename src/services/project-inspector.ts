import { existsSync } from "node:fs"
import { readdir, readFile, stat } from "node:fs/promises"
import { join, relative, resolve } from "node:path"
import { IGNORED_DIRECTORIES } from "../constants.js"
import type { MedusaPackage, PackageJson, ProjectInspection } from "../types.js"

const MEDUSA_PACKAGE_PREFIX = "@medusajs/"
const CONFIG_FILE_NAMES = new Set([
  "medusa-config.ts",
  "medusa-config.js",
  "medusa-config.mjs",
  "medusa-config.cjs",
])

function getAllDependencies(packageJson: PackageJson): MedusaPackage[] {
  const groups = [
    ["dependencies", packageJson.dependencies],
    ["devDependencies", packageJson.devDependencies],
    ["peerDependencies", packageJson.peerDependencies],
  ] as const

  return groups.flatMap(([dependencyType, dependencies]) =>
    Object.entries(dependencies ?? {})
      .filter(([name]) => name.startsWith(MEDUSA_PACKAGE_PREFIX))
      .map(([name, version]) => ({ name, version, dependencyType })),
  )
}

function selectMedusaVersion(packages: MedusaPackage[]): string | null {
  const preferred = packages.find(({ name }) =>
    ["@medusajs/framework", "@medusajs/medusa", "@medusajs/cli"].includes(name),
  )
  return preferred?.version ?? packages[0]?.version ?? null
}

async function walkProject(root: string, current: string, result: ProjectInspection): Promise<void> {
  const entries = await readdir(current, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".env.example") continue
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue

    const absolutePath = join(current, entry.name)
    const projectRelativePath = relative(root, absolutePath) || entry.name

    if (entry.isDirectory()) {
      if (current === root) result.topLevelDirectories.push(entry.name)
      await walkProject(root, absolutePath, result)
      continue
    }

    if (CONFIG_FILE_NAMES.has(entry.name) || entry.name === "package.json" || entry.name === "tsconfig.json") {
      result.relevantFiles.push(projectRelativePath)
      if (CONFIG_FILE_NAMES.has(entry.name)) result.configFiles.push(projectRelativePath)
    }
  }
}

export async function inspectProject(projectPath: string): Promise<ProjectInspection> {
  const root = resolve(projectPath)
  if (!existsSync(root)) {
    throw new Error(`Project path does not exist: ${root}. Provide a valid Medusa project directory.`)
  }

  const rootStats = await stat(root)
  if (!rootStats.isDirectory()) {
    throw new Error(`Project path is not a directory: ${root}. Provide the project root directory.`)
  }

  const packageJsonPath = join(root, "package.json")
  let packageJson: PackageJson = {}
  let packageJsonExists = false

  if (existsSync(packageJsonPath)) {
    packageJsonExists = true
    try {
      packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as PackageJson
    } catch {
      throw new Error(`Could not parse ${packageJsonPath}. Fix the JSON before inspecting this project.`)
    }
  }

  const medusaPackages = getAllDependencies(packageJson)
  const result: ProjectInspection = {
    projectPath: root,
    packageJsonPath: packageJsonExists ? packageJsonPath : null,
    packageName: packageJson.name ?? null,
    packageManager: packageJson.packageManager ?? null,
    medusaVersion: selectMedusaVersion(medusaPackages),
    medusaPackages,
    configFiles: [],
    topLevelDirectories: [],
    relevantFiles: packageJsonExists ? ["package.json"] : [],
  }

  await walkProject(root, root, result)
  result.configFiles.sort()
  result.topLevelDirectories.sort()
  result.relevantFiles = [...new Set(result.relevantFiles)].sort()
  return result
}

export function formatInspectionMarkdown(result: ProjectInspection): string {
  const packageLines = result.medusaPackages.length
    ? result.medusaPackages.map((pkg) => `- ${pkg.name}: ${pkg.version} (${pkg.dependencyType})`).join("\n")
    : "- No `@medusajs/*` dependencies found in the root package.json."

  return [
    "# Medusa Project Inspection",
    "",
    `- **Project path:** \`${result.projectPath}\``,
    `- **Package:** ${result.packageName ?? "Not detected"}`,
    `- **Detected Medusa version:** ${result.medusaVersion ?? "Not detected"}`,
    `- **Package manager:** ${result.packageManager ?? "Not declared"}`,
    "",
    "## Medusa Packages",
    packageLines,
    "",
    "## Configuration Files",
    result.configFiles.length ? result.configFiles.map((file) => `- \`${file}\``).join("\n") : "None detected.",
    "",
    "## Relevant Files",
    result.relevantFiles.length ? result.relevantFiles.map((file) => `- \`${file}\``).join("\n") : "None detected.",
  ].join("\n")
}
