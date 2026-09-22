# Universal Medusa MCP

This folder will contain a general-purpose MCP server for researching,
understanding, validating, and eventually assisting with any Medusa project.

## Current status

The read-only stdio server currently exposes:

- `medusa_detect_version`
- `medusa_inspect_project`
- `medusa_search_docs`

Run the local smoke test with `bun run smoke`.

Project structure:

```text
medusa-mcp/
├── evaluations/
├── scripts/
├── src/
│   ├── schemas/
│   ├── services/
│   └── tools/
├── package.json
└── tsconfig.json
```

## Required software

Install these tools on the development machine:

- Bun: https://bun.sh/
- Git: https://git-scm.com/downloads
- ripgrep: https://github.com/BurntSushi/ripgrep/releases

On Windows, the simplest options are:

```powershell
winget install Oven-sh.Bun
winget install Git.Git
winget install BurntSushi.ripgrep.MSVC
```

Do not install pnpm or npm dependencies for this project. Bun is the package
manager, runtime, test runner, and script runner.

## Planned stack

- TypeScript
- Bun
- MCP TypeScript SDK
- Zod for tool input validation
- Bun's built-in SQLite support with FTS5 for local documentation and source search
- Octokit for GitHub API access
- Vitest-compatible Bun tests initially
- stdio transport for local MCP clients
- Streamable HTTP transport later for hosted usage

## Planned dependency installation

The dependencies will be installed from this folder with Bun once the project
scaffold is created:

```powershell
bun add @modelcontextprotocol/server @modelcontextprotocol/node zod
bun add octokit execa fast-glob
bun add -d typescript @types/node
```

SQLite will use Bun's built-in `bun:sqlite`; no native SQLite package is
required.

The project should not require a Medusa Cloud account. It will index public
Medusa documentation and source material, inspect the Medusa project supplied
by the user, and use the installed Medusa version to produce version-aware
answers.

## Initial scope

The first release should be read-only and provide tools for:

- Detecting a project's Medusa version
- Inspecting Medusa configuration and installed packages
- Searching Medusa documentation and source
- Searching official GitHub issues and releases
- Finding native Medusa solutions before suggesting custom code
- Checking whether an API or pattern is compatible with the detected version
- Generating an implementation plan

Runtime mutations, product changes, order changes, and database operations are
out of scope for the initial release.
