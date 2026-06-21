import { tool } from "@opencode-ai/plugin/tool"
import { z } from "zod"
import { existsSync } from "fs"
import { join } from "path"

const LINTER_MAP: Record<string, { tool: string; configFiles: string[]; check: string; fix: string }> = {
  typescript: { tool: "biome", configFiles: ["biome.json"], check: "npx biome lint --files-ignore-unknown=true", fix: "npx biome lint --write --files-ignore-unknown=true" },
  javascript: { tool: "biome", configFiles: ["biome.json"], check: "npx biome lint --files-ignore-unknown=true", fix: "npx biome lint --write --files-ignore-unknown=true" },
  python: { tool: "ruff", configFiles: ["pyproject.toml", "ruff.toml"], check: "ruff check .", fix: "ruff check --fix ." },
  go: { tool: "golangci-lint", configFiles: [".golangci.yml", ".golangci.yaml"], check: "golangci-lint run ./...", fix: "golangci-lint run --fix ./..." },
  rust: { tool: "clippy", configFiles: ["clippy.toml"], check: "cargo clippy -- -D warnings", fix: "cargo clippy --fix --allow-dirty" },
}

const ESLINT_FILES = [".eslintrc.js", ".eslintrc.cjs", ".eslintrc.json", ".eslintrc.yaml", ".eslintrc.yml", "eslint.config.js", "eslint.config.mjs", "eslint.config.ts"]

function detectLinter(dir: string): Record<string, unknown> {
  for (const f of ESLINT_FILES) {
    if (existsSync(join(dir, f))) {
      return { tool: "eslint", configFiles: [f], check: "npx eslint .", fix: "npx eslint . --fix" }
    }
  }

  if (existsSync(join(dir, "biome.json"))) {
    return LINTER_MAP.typescript
  }

  for (const [lang, info] of Object.entries(LINTER_MAP)) {
    for (const cf of info.configFiles) {
      if (existsSync(join(dir, cf))) return { ...info, language: lang }
    }
  }

  const langGuesses = [
    { condition: () => existsSync(join(dir, "tsconfig.json")) || existsSync(join(dir, "package.json")), lang: "typescript" },
    { condition: () => existsSync(join(dir, "pyproject.toml")) || existsSync(join(dir, "requirements.txt")), lang: "python" },
    { condition: () => existsSync(join(dir, "go.mod")), lang: "go" },
    { condition: () => existsSync(join(dir, "Cargo.toml")), lang: "rust" },
  ]

  for (const { condition, lang } of langGuesses) {
    if (condition()) return { ...LINTER_MAP[lang], language: lang, configFound: false }
  }

  return { tool: "none", message: "No linter detected" }
}

export const lintCheck = tool({
  description: "Detect and run the appropriate linter based on project config files. Supports ESLint, Biome, Ruff, golangci-lint, and Clippy.",
  args: {
    project: z.string().optional().describe("Project directory path"),
    fix: z.boolean().default(false).describe("Auto-fix issues when possible"),
  },
  async execute({ project, fix = false }, ctx) {
    const dir = project || ctx.directory || process.cwd()
    const shouldFix = fix
    const linter = detectLinter(dir)

    return JSON.stringify({
      project: dir,
      linter: linter.tool,
      configFound: linter.configFound !== false,
      command: shouldFix && linter.fix ? linter.fix : linter.check,
      message: linter.tool === "none"
        ? "No linter detected. Install one: ESLint (JS/TS), Ruff (Python), golangci-lint (Go), Clippy (Rust)"
        : shouldFix
          ? `Run: ${linter.fix}`
          : `Run: ${linter.check}`,
    })
  },
})
