import { tool } from "@opencode-ai/plugin/tool"
import { z } from "zod"
import { existsSync } from "fs"
import { join } from "path"

const FORMATTER_MAP: Record<string, { tool: string; install: string; check: string; fix: string; configFile: string }> = {
  ".ts": { tool: "biome", install: "npm install --save-dev @biomejs/biome", check: "npx biome format --files-ignore-unknown=true", fix: "npx biome format --write --files-ignore-unknown=true", configFile: "biome.json" },
  ".tsx": { tool: "biome", install: "npm install --save-dev @biomejs/biome", check: "npx biome format --files-ignore-unknown=true", fix: "npx biome format --write --files-ignore-unknown=true", configFile: "biome.json" },
  ".js": { tool: "biome", install: "npm install --save-dev @biomejs/biome", check: "npx biome format --files-ignore-unknown=true", fix: "npx biome format --write --files-ignore-unknown=true", configFile: "biome.json" },
  ".jsx": { tool: "biome", install: "npm install --save-dev @biomejs/biome", check: "npx biome format --files-ignore-unknown=true", fix: "npx biome format --write --files-ignore-unknown=true", configFile: "biome.json" },
  ".json": { tool: "biome", install: "npm install --save-dev @biomejs/biome", check: "npx biome format", fix: "npx biome format --write", configFile: "biome.json" },
  ".css": { tool: "prettier", install: "npm install --save-dev prettier", check: "npx prettier --check", fix: "npx prettier --write", configFile: ".prettierrc" },
  ".html": { tool: "prettier", install: "npm install --save-dev prettier", check: "npx prettier --check", fix: "npx prettier --write", configFile: ".prettierrc" },
  ".md": { tool: "prettier", install: "npm install --save-dev prettier", check: "npx prettier --check", fix: "npx prettier --write", configFile: ".prettierrc" },
  ".py": { tool: "black", install: "pip install black", check: "black --check", fix: "black", configFile: "pyproject.toml" },
  ".go": { tool: "gofmt", install: "go fmt", check: "gofmt -l", fix: "gofmt -w", configFile: "go.mod" },
  ".rs": { tool: "rustfmt", install: "rustup component add rustfmt", check: "cargo fmt --check", fix: "cargo fmt", configFile: "rustfmt.toml" },
}

export const formatCode = tool({
  description: "Detect and run the appropriate code formatter for a given file based on extension and config presence.",
  args: {
    file: z.string().describe("File path to format"),
    project: z.string().optional().describe("Project directory path (for config detection)"),
    check: z.boolean().default(false).describe("Check only, don't apply changes"),
  },
  async execute({ file = "", project, check = false }, ctx) {
    const filePath = file
    const dir = project || ctx.directory || process.cwd()
    const checkOnly = check

    const ext = filePath.split(".").pop()
    if (!ext || !FORMATTER_MAP[`.${ext}`]) {
      return JSON.stringify({ file: filePath, formatter: "none", message: "No formatter configured for this file type" })
    }

    const fmt = FORMATTER_MAP[`.${ext}`]
    const hasConfig = existsSync(join(dir, fmt.configFile))

    if (fmt.tool === "biome" && !existsSync(join(dir, "biome.json")) && existsSync(join(dir, ".prettierrc"))) {
      return JSON.stringify({
        file: filePath,
        formatter: "prettier",
        configFound: true,
        command: checkOnly
          ? `npx prettier --check "${filePath}"`
          : `npx prettier --write "${filePath}"`,
      })
    }

    return JSON.stringify({
      file: filePath,
      formatter: fmt.tool,
      configFound: hasConfig,
      command: checkOnly
        ? `${fmt.check} "${filePath}"`
        : `${fmt.fix} "${filePath}"`,
      install: hasConfig ? undefined : fmt.install,
    })
  },
})
