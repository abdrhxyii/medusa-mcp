import { z } from "zod"

export const ResponseFormatSchema = z
  .enum(["markdown", "json"])
  .default("markdown")
  .describe("Output format. Use markdown for readable answers or json for structured output.")

export const ProjectPathSchema = z
  .string()
  .min(1)
  .max(2_000)
  .default(".")
  .describe("Absolute or relative path to the root of a Medusa project. Defaults to the current directory.")
