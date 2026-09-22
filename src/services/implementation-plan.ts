import { identifyNativePattern } from "./native-patterns.js"

export async function generateImplementationPlan(requirement: string, projectPath: string) {
  const recommendation = await identifyNativePattern(requirement, projectPath)
  const steps = [
    "Inspect the detected Medusa version and existing project structure.",
    `Confirm the native pattern: ${recommendation.pattern}.`,
    "Read the relevant official Medusa documentation topics before designing files.",
    ...recommendation.recommended_components.map((component) => `Design the ${component.toLowerCase()} boundary.`),
    "Check existing workflows, modules, links, routes, and admin extensions for reusable behavior.",
    "Define validation, error handling, and lifecycle behavior.",
    "Review the design against the listed anti-patterns before implementation.",
    "Only then prepare implementation changes and targeted verification.",
  ]
  return { requirement, recommendation, steps }
}

export function formatImplementationPlanMarkdown(output: Awaited<ReturnType<typeof generateImplementationPlan>>): string {
  return [`# Medusa Implementation Plan`, "", `## Recommended Pattern\n${output.recommendation.pattern} (${output.recommendation.confidence} confidence)`, "", "## Steps", ...output.steps.map((step, index) => `${index + 1}. ${step}`), "", "## Avoid", ...output.recommendation.avoid.map((item) => `- ${item}`)].join("\n")
}
