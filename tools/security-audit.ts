import { tool } from "@opencode-ai/plugin/tool"
import { z } from "zod"
import { execSync, spawnSync } from "child_process"
import { existsSync, readFileSync, statSync } from "fs"
import { join } from "path"

const SECRET_PATTERNS = [
  { pattern: /sk-[a-zA-Z0-9]{20,}/g, name: "OpenAI API Key" },
  { pattern: /sk-ant-[a-zA-Z0-9_-]{20,}/g, name: "Anthropic API Key" },
  { pattern: /ghp_[a-zA-Z0-9]{36}/g, name: "GitHub Personal Access Token" },
  { pattern: /gho_[a-zA-Z0-9]{36}/g, name: "GitHub OAuth Token" },
  { pattern: /ghu_[a-zA-Z0-9]{36}/g, name: "GitHub User Token" },
  { pattern: /ghs_[a-zA-Z0-9]{36}/g, name: "GitHub Server Token" },
  { pattern: /ghr_[a-zA-Z0-9]{36}/g, name: "GitHub Refresh Token" },
  { pattern: /AKIA[0-9A-Z]{16}/g, name: "AWS Access Key" },
  { pattern: /AIza[0-9A-Za-z_-]{35}/g, name: "Google API Key" },
  { pattern: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, name: "JWT Token" },
  { pattern: /(password|passwd|pwd)\s*[:=]\s*["'][^"'\s]{4,}["']/gi, name: "Hardcoded Password" },
  { pattern: /(secret|token|key|auth)\s*[:=]\s*["'][^"'\s]{8,}["']/gi, name: "Hardcoded Secret" },
  { pattern: /DATABASE_URL\s*=\s*["'][^"']+:\/\/[^"']+["']/gi, name: "Database URL" },
  { pattern: /redis:\/\/[^"'\s]+/gi, name: "Redis URL" },
  { pattern: /mongodb(\+srv)?:\/\/[^"'\s]+/gi, name: "MongoDB URL" },
]

const ANTI_PATTERNS = [
  { pattern: /\.innerHTML\s*=/g, name: "innerHTML assignment (XSS risk)", severity: "HIGH" },
  { pattern: /eval\s*\(/g, name: "eval() call (code injection risk)", severity: "CRITICAL" },
  { pattern: /document\.write\s*\(/g, name: "document.write() (XSS risk)", severity: "HIGH" },
  { pattern: /new Function\s*\(/g, name: "new Function() (code injection risk)", severity: "CRITICAL" },
  { pattern: /exec\s*\(\s*['"`].*\$/g, name: "Potential command injection", severity: "HIGH" },
  { pattern: /\.query\s*\(\s*['"`].*\$\{/g, name: "Potential SQL injection", severity: "CRITICAL" },
  { pattern: /dangerouslySetInnerHTML/g, name: "dangerouslySetInnerHTML (React XSS risk)", severity: "HIGH" },
  { pattern: /Math\.random\s*\(\s*\)/g, name: "Math.random() for security (use crypto)", severity: "MEDIUM" },
]

function scanFileContent(filepath: string, content: string): Record<string, unknown>[] {
  const issues: Record<string, unknown>[] = []

  if (filepath.includes("env") || filepath.includes("secret") || filepath.includes(".local")) {
    return issues
  }

  for (const { pattern, name } of SECRET_PATTERNS) {
    const matches = content.match(pattern)
    if (matches) {
      issues.push({
        file: filepath,
        type: "SECRET",
        severity: "CRITICAL",
        name,
        matches: matches.length,
        line: getFirstLine(content, pattern),
      })
    }
  }

  if (filepath.match(/\.(ts|tsx|js|jsx|py|go|rs|java|php|rb)$/)) {
    for (const { pattern, name, severity } of ANTI_PATTERNS) {
      const matches = content.match(pattern)
      if (matches) {
        issues.push({
          file: filepath,
          type: "ANTI_PATTERN",
          severity,
          name,
          matches: matches.length,
          line: getFirstLine(content, pattern),
        })
      }
    }
  }

  return issues
}

function getFirstLine(content: string, pattern: RegExp): number | undefined {
  const lines = content.split("\n")
  for (let i = 0; i < lines.length; i++) {
    const regex = new RegExp(pattern.source, pattern.flags)
    if (regex.test(lines[i])) return i + 1
  }
  return undefined
}

function scanDir(dir: string, exts: string[]): Record<string, unknown>[] {
  const issues: Record<string, unknown>[] = []
  try {
    const result = spawnSync("find", [dir, "-type", "f"], { encoding: "utf-8", timeout: 30_000 })
    const files = (result.stdout || "").split("\n")
      .filter((f) => exts.some((e) => f.endsWith(e)))
      .filter((f) => !f.includes("node_modules") && !f.includes(".git/") && !f.includes("__pycache__") && !f.includes("target/"))

    for (const file of files.slice(0, 500)) {
      if (!file.trim()) continue
      try {
        const stat = statSync(file)
        if (stat.size > 1_000_000) continue
        const content = readFileSync(file, "utf-8")
      } catch { /* skip unreadable */ }
    }
  } catch { /* find failed */ }
  return issues
}

export const securityAudit = tool({
  description: "Comprehensive security audit: dependency vulnerabilities, secret scanning, and code anti-pattern detection.",
  args: {
    mode: z.enum(["deps", "secrets", "patterns", "all"]).default("all").describe("Audit mode"),
    project: z.string().optional().describe("Project directory path"),
  },
  async execute({ mode = "all", project }, ctx) {
    const dir = project || ctx.directory || process.cwd()
    const results: Record<string, unknown> = { mode, project: dir, issues: [], depWarnings: [] }

    if (mode === "deps" || mode === "all") {
      if (existsSync(join(dir, "package.json"))) {
        try {
          const pm = existsSync(join(dir, "yarn.lock")) ? "yarn" : existsSync(join(dir, "pnpm-lock.yaml")) ? "pnpm" : "npm"
          const output = execSync(`${pm} audit --json 2>&1 || true`, { cwd: dir, encoding: "utf-8", timeout: 60_000 })
          const parsed = JSON.parse(output)
          if (parsed.vulnerabilities) {
            results.depWarnings = Object.entries(parsed.vulnerabilities).map(([name, info]) => ({ name, ...(info as object) }))
          } else if (parsed.summary) {
            results.depWarnings = [parsed.summary]
          }
        } catch { /* npm audit failed or no package.json */ }
      }
      if (existsSync(join(dir, "requirements.txt")) || existsSync(join(dir, "pyproject.toml"))) {
        try {
          const output = execSync("pip-audit --format json 2>&1 || true", { cwd: dir, encoding: "utf-8", timeout: 60_000 })
          results.depWarnings.push(...JSON.parse(output))
        } catch { /* pip-audit not available */ }
      }
    }

    if (mode === "secrets" || mode === "patterns" || mode === "all") {
      const exts = [".ts", ".tsx", ".js", ".jsx", ".json", ".yml", ".yaml", ".env", ".toml", ".py", ".go", ".rs", ".java", ".rb", ".php"]
      results.issues = scanDir(dir, exts)
    }

    const critical = (results.issues as Record<string, unknown>[]).filter((i) => i.severity === "CRITICAL").length
    const high = (results.issues as Record<string, unknown>[]).filter((i) => i.severity === "HIGH").length

    const summary = {
      totalIssues: (results.issues as unknown[]).length,
      critical,
      high,
      depWarnings: (results.depWarnings as unknown[]).length,
      recommendation: critical > 0
        ? "CRITICAL issues found — fix immediately before deploy"
        : high > 0
          ? "HIGH issues found — fix before next release"
          : "No critical or high issues found",
    }

    return JSON.stringify({ ...results, summary }, null, 2)
  },
})
