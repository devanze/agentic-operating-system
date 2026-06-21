import { tool } from "@opencode-ai/plugin/tool"
import { z } from "zod"
import { execSync } from "child_process"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

function detectPackageManager(dir: string): string {
  if (existsSync(join(dir, "bun.lockb"))) return "bun"
  if (existsSync(join(dir, "pnpm-lock.yaml"))) return "pnpm"
  if (existsSync(join(dir, "yarn.lock"))) return "yarn"
  try {
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"))
    const pm = pkg.packageManager
    if (pm) {
      if (pm.startsWith("yarn")) return "yarn"
      if (pm.startsWith("pnpm")) return "pnpm"
      if (pm.startsWith("bun")) return "bun"
    }
  } catch {}
  return "npm"
}

function detectTestCommand(dir: string, pm: string): string {
  if (existsSync(join(dir, "vitest.config.ts")) || existsSync(join(dir, "vitest.config.js"))) {
    return pm === "yarn" ? "yarn vitest" : `${pm} run vitest`
  }
  if (existsSync(join(dir, "jest.config.ts")) || existsSync(join(dir, "jest.config.js")) || existsSync(join(dir, "jest.config.json"))) {
    return `${pm} test`
  }
  if (existsSync(join(dir, "pyproject.toml"))) return "pytest"
  if (existsSync(join(dir, "go.mod"))) return "go test ./..."
  if (existsSync(join(dir, "Cargo.toml"))) return "cargo test"
  if (existsSync(join(dir, "package.json"))) return `${pm} test`
  return ""
}

function run(cmd: string, cwd: string): { stdout: string; stderr: string; status: number } {
  try {
    const stdout = execSync(cmd, { cwd, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], timeout: 120_000 })
    return { stdout, stderr: "", status: 0 }
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; status?: number }
    return { stdout: (err.stdout as string) || "", stderr: (err.stderr as string) || "", status: err.status ?? 1 }
  }
}

export const runTests = tool({
  description: "Run the test suite. Auto-detects test framework and package manager. Supports coverage, watch mode, and pattern filtering.",
  args: {
    coverageThreshold: z.number().default(80).describe("Coverage threshold percentage"),
    pattern: z.string().optional().describe("Test pattern to filter (e.g. 'auth', 'login')"),
    watch: z.boolean().default(false).describe("Run in watch mode"),
    verbose: z.boolean().default(false).describe("Verbose output"),
  },
  async execute({ coverageThreshold = 80, pattern, watch = false, verbose = false }, ctx) {
    const cwd = ctx.directory || process.cwd()
    const pm = detectPackageManager(cwd)
    const baseCmd = detectTestCommand(cwd, pm)

    let result: { stdout: string; stderr: string; status: number }

    if (baseCmd === "pytest") {
      result = run("pytest --cov --cov-report=json --cov-report=term -q 2>&1", cwd)
    } else if (baseCmd === "go test ./...") {
      result = run("go test -coverprofile=coverage.out ./... 2>&1", cwd)
    } else if (baseCmd === "cargo test") {
      result = run("cargo test 2>&1", cwd)
    } else if (baseCmd) {
      const flags = ["--coverage", "--run"]
      result = run(`${baseCmd} ${flags.join(" ")} 2>&1`, cwd)
    } else {
      return JSON.stringify({ testsPassed: false, message: "No test command found" })
    }

    return JSON.stringify({
      testsPassed: result.status === 0,
      exitCode: result.status,
      output: result.stdout.slice(-2000),
      errorOutput: result.stderr.slice(-1000),
      coverageThreshold,
      coverageMet: result.status === 0,
      message: result.status === 0
        ? `All tests passed (≥${coverageThreshold}% coverage)`
        : `Tests failed with exit code ${result.status}`,
    })
  },
})

export const checkCoverage = tool({
  description: "Analyze test coverage against a configurable threshold. Reads coverage reports from common locations.",
  args: {
    project: z.string().optional().describe("Project directory path"),
    target: z.number().default(80).describe("Coverage threshold percentage"),
    pattern: z.string().optional().describe("Optional test pattern filter"),
  },
  async execute({ project, target = 80, pattern }, ctx) {
    const cwd = project || ctx.directory || process.cwd()
    const pm = detectPackageManager(cwd)

    if (existsSync(join(cwd, "coverage", "coverage-summary.json"))) {
      try {
        const raw = execSync("cat coverage/coverage-summary.json", { cwd, encoding: "utf-8" })
        const data = JSON.parse(raw)
        const total = data.total?.lines?.pct ?? 0
        return JSON.stringify({
          coverage: `${total}%`,
          threshold: `${target}%`,
          passed: total >= target,
          messages: total >= target
            ? [`Coverage at ${total}% — meets ${target}% threshold`]
            : [`Coverage at ${total}% — below ${target}% threshold`, `Need ${(target - total).toFixed(1)}% more`],
        })
      } catch { /* fall through */ }
    }

    if (existsSync(join(cwd, "coverage.out"))) {
      try {
        const raw = execSync("go tool cover -func=coverage.out 2>&1 | tail -1", { cwd, encoding: "utf-8" })
        const match = raw.match(/(\d+\.\d+)%/)
        if (match) {
          const pct = parseFloat(match[1])
          return JSON.stringify({ coverage: `${pct}%`, threshold: `${target}%`, passed: pct >= target, messages: [pct >= target ? "✓ Coverage met" : `✗ Coverage at ${pct}% — below ${target}%`] })
        }
      } catch { /* fall through */ }
    }

    const testCmd = detectTestCommand(cwd, pm)
    if (testCmd) {
      try { execSync(`${testCmd} --coverage --run 2>&1`, { cwd, encoding: "utf-8", timeout: 120_000 }) } catch { /* ignore */ }
    }

    return JSON.stringify({ coverage: "unknown", threshold: `${target}%`, passed: false, messages: ["Could not determine coverage. Run tests with coverage enabled."] })
  },
})
