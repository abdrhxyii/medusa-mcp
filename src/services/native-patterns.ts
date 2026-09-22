import { inspectProject } from "./project-inspector.js"

export interface NativePatternRecommendation {
  requirement: string
  detected_medusa_version: string | null
  pattern: string
  confidence: "high" | "medium" | "low"
  reason: string
  recommended_components: string[]
  avoid: string[]
  documentation_topics: string[]
}

interface PatternRule {
  pattern: string
  keywords: string[]
  confidence: NativePatternRecommendation["confidence"]
  reason: string
  components: string[]
  avoid: string[]
  topics: string[]
}

const RULES: PatternRule[] = [
  { pattern: "Module Link", keywords: ["product", "variant", "customer", "order", "custom data", "attach", "extend"], confidence: "high", reason: "Custom data related to a core Medusa domain should remain in its own module and be connected through a module link.", components: ["Custom module", "Module link", "Optional workflow for lifecycle synchronization"], avoid: ["Forking a core Commerce Module", "Using metadata as a substitute for relational custom data", "Direct database writes from API routes"], topics: ["Modules", "Module Links", "Extend Core Commerce Features"] },
  { pattern: "Custom Module", keywords: ["domain", "business entity", "custom model", "data model", "external system"], confidence: "high", reason: "A reusable domain or integration should be isolated in a custom module.", components: ["Module definition", "Data model", "Module service"], avoid: ["Putting domain persistence directly in an API route", "Changing Medusa core package source"], topics: ["Modules", "Data Models", "Module Isolation"] },
  { pattern: "Workflow", keywords: ["multi-step", "transaction", "rollback", "orchestration", "business flow", "sync"], confidence: "high", reason: "Multi-step business operations belong in workflows so steps and compensation can be composed consistently.", components: ["Workflow", "Workflow steps", "Compensation functions where needed"], avoid: ["Long business transactions embedded in route handlers", "Duplicating core workflow logic without checking existing workflows"], topics: ["Workflows", "Compensation Function", "Core Workflows Reference"] },
  { pattern: "API Route", keywords: ["endpoint", "http", "rest api", "custom api", "route"], confidence: "high", reason: "Custom HTTP access should be exposed through a Medusa API route that delegates business logic to workflows or services.", components: ["API route", "Request validation", "Workflow or module service"], avoid: ["Business persistence directly in the handler", "Bypassing authentication and validation"], topics: ["API Routes", "Request Body and Query Parameter Validation", "Protected API Routes"] },
  { pattern: "Subscriber", keywords: ["event", "react", "after order", "after product", "notification", "trigger"], confidence: "high", reason: "Event-driven reactions should be implemented as subscribers rather than coupled into unrelated request handlers.", components: ["Subscriber", "Event payload typing", "Idempotent downstream operation"], avoid: ["Polling when an event is available", "Assuming event delivery is exactly once"], topics: ["Events and Subscribers", "Event Data Payload"] },
  { pattern: "Scheduled Job", keywords: ["schedule", "cron", "periodic", "nightly", "recurring"], confidence: "high", reason: "Periodic work should use Medusa scheduled jobs with an explicit interval and safe repeat behavior.", components: ["Scheduled job", "Idempotent task logic"], avoid: ["Starting independent timers inside request code", "Non-idempotent repeated operations"], topics: ["Scheduled Jobs", "Set Interval for Scheduled Jobs"] },
  { pattern: "Provider Module", keywords: ["payment", "shipping", "fulfillment", "storage", "email", "notification provider", "third-party provider"], confidence: "high", reason: "External infrastructure integrations should use the relevant Medusa provider module contract.", components: ["Provider module", "Provider service", "Configuration in medusa-config"], avoid: ["Calling provider APIs directly from product or order routes", "Hard-coding credentials"], topics: ["Modules", "Integrations", "Medusa Configuration"] },
  { pattern: "Admin Extension", keywords: ["admin", "dashboard", "widget", "merchant ui", "admin page"], confidence: "high", reason: "Merchant-facing UI belongs in Medusa Admin extensions such as widgets or UI routes.", components: ["Admin widget or UI route", "Admin API data access"], avoid: ["Modifying Medusa Admin core source", "Putting merchant operations only in the storefront"], topics: ["Admin Development", "Admin Widgets", "Admin UI Routes"] },
  { pattern: "Plugin", keywords: ["reusable", "multiple projects", "publish", "share customization"], confidence: "medium", reason: "A collection of reusable Medusa customizations can be packaged as a plugin.", components: ["Plugin package", "One or more modules, workflows, routes, or admin extensions"], avoid: ["Making every project-specific feature a plugin", "Using a plugin where a single module is sufficient"], topics: ["Plugins", "Create a Plugin", "Reuse Customizations with Plugins"] },
]

export async function identifyNativePattern(requirement: string, projectPath: string): Promise<NativePatternRecommendation> {
  const inspection = await inspectProject(projectPath)
  const normalized = requirement.toLowerCase()
  const ranked = RULES.map((rule) => ({ rule, score: rule.keywords.reduce((score, keyword) => score + (normalized.includes(keyword) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score)
  const selected = ranked[0]?.score ? ranked[0].rule : null

  if (!selected) {
    return {
      requirement,
      detected_medusa_version: inspection.medusaVersion,
      pattern: "Needs clarification",
      confidence: "low",
      reason: "The requirement did not match a known Medusa core extension pattern. Inspect the project and clarify the domain, trigger, data ownership, and consumer before designing custom code.",
      recommended_components: ["First inspect existing Commerce Modules and Framework extension points"],
      avoid: ["Creating a custom module before identifying the domain boundary", "Adding a new database table without checking module links and existing modules"],
      documentation_topics: ["Framework Overview", "Modules", "Workflows", "Module Links"],
    }
  }

  return { requirement, detected_medusa_version: inspection.medusaVersion, pattern: selected.pattern, confidence: selected.confidence, reason: selected.reason, recommended_components: selected.components, avoid: selected.avoid, documentation_topics: selected.topics }
}

export function formatNativePatternMarkdown(result: NativePatternRecommendation): string {
  return [`# Native Medusa Pattern`, "", `- **Recommended pattern:** ${result.pattern}`, `- **Confidence:** ${result.confidence}`, `- **Detected Medusa version:** ${result.detected_medusa_version ?? "Not detected"}`, "", `## Why\n${result.reason}`, "", "## Recommended Components", ...result.recommended_components.map((item) => `- ${item}`), "", "## Avoid", ...result.avoid.map((item) => `- ${item}`), "", "## Documentation Topics", ...result.documentation_topics.map((item) => `- ${item}`)].join("\n")
}
