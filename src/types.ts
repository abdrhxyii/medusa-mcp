export type ResponseFormat = "markdown" | "json"

export interface PackageJson {
  name?: string
  version?: string
  private?: boolean
  packageManager?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  workspaces?: string[] | { packages?: string[] }
}

export interface MedusaPackage {
  name: string
  version: string
  dependencyType: "dependencies" | "devDependencies" | "peerDependencies"
}

export interface ProjectInspection {
  projectPath: string
  packageJsonPath: string | null
  packageName: string | null
  packageManager: string | null
  medusaVersion: string | null
  medusaPackages: MedusaPackage[]
  configFiles: string[]
  topLevelDirectories: string[]
  relevantFiles: string[]
}

export interface DocumentationEntry {
  title: string
  url: string
}

export interface DocumentationResult extends DocumentationEntry {
  relevance: number
  content: string
}
