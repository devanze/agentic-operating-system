import type { PluginInput } from "@opencode-ai/plugin"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { spawnSync } from "child_process"
import { runTests, checkCoverage, securityAudit, formatCode, lintCheck, gitSummary, listChangedFiles } from "../tools/index"
import { appendMetrics, type AgentCallMetric } from "../tools/metrics-writer"
import { agentMetrics } from "../tools/agent-metrics"
import { recordChange, clearChanges as clearChangeStore } from "../tools/changed-files"

type HookProfile = "minimal" | "standard" | "strict"

const PROFILE_ORDER: Record<HookProfile, number> = { minimal: 0, standard: 1, strict: 2 }

function resolveScript(script: string, worktree: string): string | null {
  const locations = [
    path.join(worktree, ".opencode", "scripts", "hooks", script),
    path.join(worktree, ".opencode", "scripts", "check", script),
    path.join(worktree, ".opencode", "scripts", "detect", script),
    path.join(worktree, ".opencode", "scripts", script),
  ]
  for (const loc of locations) {
    if (fs.existsSync(loc)) return loc
  }
  return null
}

function execScript(scriptPath: string, args: string[] = [], cwd: string, input?: string, timeout = 10000): string {
  try {
    const result = spawnSync("node", [scriptPath, ...args], {
      cwd, timeout, input, stdio: ["pipe", "pipe", "pipe"]
    })
    return result.stdout?.toString() || ""
  } catch {
    return ""
  }
}

function runHook(worktree: string, script: string, payload: Record<string, unknown> = {}, timeout = 10000): Record<string, unknown> {
  const scriptPath = resolveScript(script, worktree)
  if (!scriptPath) return {}
  try {
    const out = execScript(scriptPath, [], worktree, JSON.stringify(payload), timeout)
    if (out.trim()) return JSON.parse(out.trim())
  } catch { /* parse error */ }
  return {}
}

function runArgs(worktree: string, script: string, args: string[], timeout = 10000): string {
  const scriptPath = resolveScript(script, worktree)
  if (!scriptPath) return ""
  return execScript(scriptPath, args, worktree, undefined, timeout)
}

const AgentHooksPlugin = async ({ client, $, directory, worktree }: PluginInput) => {
  const w = worktree || directory

  const editedFiles = new Set<string>()
  const pendingToolChanges = new Map<string, { path: string; type: "added" | "modified" }>()
  const metricsStarts = new Map<string, number>()
  let writeCounter = 0
  const agentBySession = new Map<string, string>()

  const log = (level: "debug" | "info" | "warn" | "error", message: string) =>
    client.app.log({ body: { service: "agent-system", level, message } })

  const currentProfile: HookProfile =
    process.env.AGENT_HOOK_PROFILE === "minimal" ? "minimal"
    : process.env.AGENT_HOOK_PROFILE === "strict" ? "strict"
    : "standard"

  const disabledHooks = new Set(
    (process.env.AGENT_DISABLED_HOOKS || "").split(",").map(s => s.trim()).filter(Boolean)
  )

  const profileOk = (required: HookProfile[]): boolean =>
    required.some(r => PROFILE_ORDER[currentProfile] >= PROFILE_ORDER[r])

  const on = (id: string, profile: HookProfile[] = ["standard"]): boolean =>
    !disabledHooks.has(id) && profileOk(profile)

  function resolvePath(p: string): string {
    const resolved = path.resolve(path.isAbsolute(p) ? p : path.join(w, p))
    if (!resolved.startsWith(path.resolve(w) + path.sep) && resolved !== path.resolve(w)) {
      throw new Error(`Path traversal detected: ${p}`)
    }
    return resolved
  }

  function getFilePath(args: Record<string, unknown> | undefined): string | null {
    if (!args) return null
    const p = (args.filePath ?? args.file_path ?? args.path) as string | undefined
    return typeof p === "string" && p.trim() ? p : null
  }

  return {

    "file.edited": async (event: { path: string }) => {
      editedFiles.add(event.path)
      recordChange(event.path, "modified")

      if (on("post-edit-format", ["strict"]) && /\.(ts|tsx|js|jsx|json|css|html|py|go)$/.test(event.path)) {
        try { await $`prettier --write ${event.path} 2>/dev/null`; log("info", `[Hook] Formatted: ${event.path}`) } catch {}
      }

      if (on("post-edit-console-warn", ["standard", "strict"]) && /\.(ts|tsx|js|jsx)$/.test(event.path)) {
        try {
          const result = await $`grep -n "console\\.log" ${event.path} 2>/dev/null`.text()
          if (result.trim()) {
            const lines = result.trim().split("\n").length
            log("warn", `[Hook] console.log: ${event.path} (${lines})`)
          }
        } catch {}
      }
    },
    "tool.execute.before": async (input: { tool: string; sessionID: string; callID?: string; args?: Record<string, unknown> }) => {
      const fp = getFilePath(input.args)

      if (input.tool === "write" && fp) {
        const abs = resolvePath(fp)
        let type: "added" | "modified" = "modified"
        try { type = fs.existsSync(abs) ? "modified" : "added" } catch { type = "modified" }
        pendingToolChanges.set(input.callID ?? `write-${++writeCounter}-${fp}`, { path: fp, type })
      }

      if (on("pre-write-doc-warn", ["standard", "strict"]) && input.tool === "write" && fp) {
        const r = runHook(w, "pre-write-doc-warn.js", { file_path: fp })
        if (r.warning) log("warn", `[Hook] ${r.message}`)
      }

      if (on("pre-bash-long-running", ["strict"]) && input.tool === "bash") {
        const cmd = String(input.args?.command || "")
        if (cmd.match(/^(npm|pnpm|yarn|bun)\s+(install|build|test|run)/) || cmd.match(/^(cargo|go)\s+(build|test|run)/)) {
          log("info", "[Hook] Long-running command detected — consider background execution")
        }
      }

      if (on("config-protection", ["standard", "strict"]) && fp && (input.tool === "edit" || input.tool === "write")) {
        const r = runHook(w, "config-protection.js", { tool: input.tool, file_path: fp })
        if (r.blocked) log("warn", `[Hook] ${r.message}`)
      }

      if (on("agent-metrics", ["standard", "strict"])) {
        const cid = input.callID || `${input.tool}-${Date.now()}`
        metricsStarts.set(cid, Date.now())
      }
    },

    "chat.params": async (input: { sessionID: string; agent: string }) => {
      if (input.agent) {
        agentBySession.set(input.sessionID, input.agent)
      }
    },

    "tool.execute.after": async (
      input: { tool: string; sessionID: string; callID?: string; args?: Record<string, unknown> },
      _output: unknown
    ) => {
      const fp = getFilePath(input.args)

      if (input.tool === "edit" && fp) { editedFiles.add(fp); recordChange(fp, "modified") }
      if (input.tool === "write" && fp) {
        if (!pendingToolChanges.delete(input.callID ?? `write-${writeCounter}-${fp}`)) {
          editedFiles.add(fp); recordChange(fp, "modified")
        }
      }

      if (on("post-edit-typecheck", ["strict"]) && input.tool === "edit" && fp?.match(/\.tsx?$/)) {
        try {
          await $`npx tsc --noEmit 2>&1`
          log("info", "[Hook] TypeScript check passed")
        } catch (error: unknown) {
          const err = error as { stdout?: string }
          log("warn", "[Hook] TypeScript errors detected:")
          if (err.stdout) { (err.stdout as string).split("\n").slice(0, 5).forEach((l: string) => log("warn", `  ${l}`)) }
        }
      }

      const cmd = String(input.args?.command || "")
      if (input.tool === "bash" && cmd.includes("git push")) log("info", "[Hook] Push detected")
      if (input.tool === "bash" && cmd.includes("gh pr create")) log("info", "[Hook] PR created")

      if (on("session-tracker", ["standard", "strict"])) {
        runHook(w, "session-tracker.js", { tool_name: input.tool, tool_input: input.args || {} }, 5000)
      }

      if (on("quality-gate", ["strict"]) && fp && (input.tool === "edit" || input.tool === "write")) {
        runArgs(w, "quality-gate.js", [resolvePath(fp)], 30000)
      }

      if (on("post-instinct-capture", ["standard", "strict"]) && input.tool === "bash") {
        const out = _output as { exitCode?: number; stderr?: string } | undefined
        if (out?.exitCode && out.exitCode > 0 && out.stderr) {
          const errMsg = out.stderr.slice(0, 200).replace(/"/g, "'")
          runArgs(w, "instinct.js", ["record", "error", errMsg, `Fix: ${cmd.slice(0, 100)}`], 5000)
        }
      }

      if (on("agent-metrics", ["standard", "strict"])) {
        const cid = input.callID || `${input.tool}-${Date.now()}`
        const start = metricsStarts.get(cid)
        if (start) {
          const duration = Date.now() - start
          metricsStarts.delete(cid)

          const output = _output as Record<string, unknown> | undefined
          const isError = output?.exitCode !== undefined && (output.exitCode as number) > 0

          const entry: AgentCallMetric = {
            agent_name: agentBySession.get(input.sessionID) || "unknown",
            timestamp: new Date().toISOString(),
            duration_ms: duration,
            token_usage: { input: 0, output: 0 },
            success: !isError,
            error_type: isError ? String(output?.stderr || "execution_error").slice(0, 100) : null,
            tool: input.tool
          }
          appendMetrics(entry)
        }
      }
    },

    "session.created": async () => {
      if (!on("session-start")) return
      log("info", `[Hook] Session started — ${currentProfile}`)

      runHook(w, "doctor.js", { project_root: w }, 15000)

      if (on("mcp-health", ["standard", "strict"])) {
        const mcp = runHook(w, "mcp-health-check.js", { project_root: w }, 15000)
        if (mcp.unhealthy > 0) {
          log("warn", `[Hook] MCP: ${mcp.healthy} OK, ${mcp.unhealthy} unhealthy/${mcp.enabled} enabled`)
          ;(mcp.servers as Array<{ name: string; status: string; bin?: string }> || [])
            .filter((s: { status: string }) => s.status === "binary_missing")
            .forEach((s: { name: string; bin?: string }) => log("warn", `  ${s.name}: ${s.bin} not found`))
        } else if (mcp.enabled > 0) {
          log("info", `[Hook] MCP: ${mcp.healthy} healthy, 0 unhealthy/${mcp.enabled} enabled`)
        }
      }

      const env = runHook(w, "shell-env-detect.js", { project_root: w })
      const e = (env.env || {}) as Record<string, string>
      if (e.PACKAGE_MANAGER) log("info", `[Hook] PM: ${e.PACKAGE_MANAGER}`)
      if (e.PRIMARY_LANGUAGE) log("info", `[Hook] Lang: ${e.PRIMARY_LANGUAGE}`)
    },

    "session.idle": async () => {
      if (!on("session-idle", ["standard", "strict"]) || editedFiles.size === 0) return

      log("info", "[Hook] Session idle audit")

      let totalConsoleLogs = 0
      const filesWithLogs: string[] = []

      for (const file of editedFiles) {
        if (!file.match(/\.(ts|tsx|js|jsx)$/)) continue
        try {
          const result = await $`grep -c "console\\.log" ${file} 2>/dev/null`.text()
          const count = parseInt(result.trim(), 10)
          if (count > 0) { totalConsoleLogs += count; filesWithLogs.push(file) }
        } catch {}
      }

      if (totalConsoleLogs > 0) {
        log("warn", `[Hook] Audit: ${totalConsoleLogs} console.log in ${filesWithLogs.length} file(s)`)
        filesWithLogs.forEach(f => log("warn", `  - ${f}`))
      } else {
        log("info", "[Hook] Audit passed: No console.log found")
      }

      if (on("session-instinct-snapshot", ["standard", "strict"])) {
        const sid = `s-${Date.now().toString(36)}`
        const sum = `Edited ${editedFiles.size} files: ${Array.from(editedFiles).slice(0, 10).join(", ")}`
        runArgs(w, "instinct.js", ["recordSession", sid, sum], 5000)
        log("info", `[Hook] Instinct snapshot: ${sid}`)
      }

      try { await $`osascript -e 'display notification "Task completed!" with title "OpenCode"' 2>/dev/null` } catch {}

      editedFiles.clear()
    },

    "session.deleted": async () => {
      if (!on("session-end")) return
      log("info", `[Hook] Session ended — ${editedFiles.size} files changed`)

      if (on("session-cost-tracker")) {
        const mf = path.join(os.homedir(), ".opencode", "metrics", "tool-usage.jsonl")
        if (fs.existsSync(mf)) runArgs(w, "cost-tracker.js", [mf], 5000)
      }

      if (on("session-skills-health", ["standard", "strict"])) runHook(w, "skills-health.js", {}, 15000)

      editedFiles.clear()
      pendingToolChanges.clear()
      clearChangeStore()
    },

    "shell.env": async () => {
      const r = runHook(w, "shell-env-detect.js", { project_root: w })
      const env = (r.env || {}) as Record<string, string>
      env.AGENT_HOOK_PROFILE = currentProfile
      env.PROJECT_ROOT = w

      const lockfiles: Record<string, string> = {
        "bun.lockb": "bun", "pnpm-lock.yaml": "pnpm",
        "yarn.lock": "yarn", "package-lock.json": "npm",
      }
      for (const [lock, pm] of Object.entries(lockfiles)) {
        try { if (fs.statSync(resolvePath(lock)).isFile()) { env.PACKAGE_MANAGER = pm; break } } catch {}
      }

      const langFiles: Record<string, string> = {
        "tsconfig.json": "typescript", "go.mod": "go",
        "pyproject.toml": "python", "Cargo.toml": "rust",
      }
      const detected: string[] = []
      for (const [file, lang] of Object.entries(langFiles)) {
        try { if (fs.statSync(resolvePath(file)).isFile()) detected.push(lang) } catch {}
      }
      if (detected.length > 0) { env.DETECTED_LANGUAGES = detected.join(","); env.PRIMARY_LANGUAGE = detected[0] }

      return env
    },

    "experimental.session.compacting": async () => ({
      context: [
        "# Agent System (preserve)",
        "",
        "## Active Agents",
        "- planner, architect, code-architect, tdd-guide, code-reviewer, security-reviewer",
        "- build-error-resolver, django-build-resolver, database-reviewer, e2e-runner",
        "- uiux-designer, seo-specialist, performance-optimizer, refactor-cleaner, doc-updater",
        "- loop-operator, code-explorer",
        "",
        "## Key Principles",
        "- Plan complexity-gated (skip planner for trivial/small tasks)",
        "- TDD: tests first, 80%+ coverage",
        "- Immutability: never mutate, return new copies",
        "- Security: validate inputs, no hardcoded secrets",
        "- Minimal changes: fix only what's broken",
      ].join("\n"),
      compaction_prompt:
        "Preserve: current task, key decisions, files touched, remaining work. Discard: verbose outputs, intermediate exploration, redundant listings.",
    }),

    "permission.ask": async (event: { tool: string; args: unknown }) => {
      const args = event.args as Record<string, unknown> || {}
      const cmd = String(args.command || "")

      log("info", `[Hook] Permission requested: ${event.tool}`)

      if (["read", "glob", "grep", "list", "search"].includes(event.tool)) {
        return { approved: true, reason: "Read-only operation" }
      }

      if (event.tool === "bash" && /^(npx )?(prettier|biome|black|gofmt|rustfmt)/.test(cmd)) {
        return { approved: true, reason: "Formatter execution" }
      }

      if (event.tool === "bash" && /^(npm test|npx vitest|npx jest|pytest|go test|cargo test)/.test(cmd)) {
        return { approved: true, reason: "Test execution" }
      }

      if (event.tool === "bash") {
        // BLOCK: any interpreter that can write files via inline code
        const interpreterWritePattern = /\b(python3?|node|ruby|perl|php)\s+(-c|-e|-r|--exec)\s+["'].*?(open|write|writeFile|writeFileSync|fs\.write|File\.write|spurt|print\s+FH|file_put_contents|fwrite)\b/

        // BLOCK: write via redirect > or >> to ANY path (not just known extensions)
        const redirectWritePattern = /\b\d*>\s*(?!&)[^\s|;&]+/

        // BLOCK: tee writing directly to files (not just with redirect)
        const teeWritePattern = /\btee\s+(?:\S+\s+)*\S+(?:\s+|$)/

        // BLOCK: sed -i inline edits
        const sedInlinePattern = /\bsed\s+(-i[^\s]*)\s/

        // BLOCK: dd with of= (output file)
        const ddWritePattern = /\bdd\s+.*\bof=/

        // BLOCK: cp/mv to specific paths
        const cpMvPattern = /\b(cp|mv)\s+.*\s+\S+/

        if (interpreterWritePattern.test(cmd)) {
          return { approved: false, reason: "Writing files via interpreter (-c/-e/-r) is not allowed. Use write/edit tool instead." }
        }
        if (redirectWritePattern.test(cmd)) {
          return { approved: false, reason: "Writing files via Bash redirect (> or >>) is not allowed. Use write/edit tool instead." }
        }
        if (teeWritePattern.test(cmd)) {
          return { approved: false, reason: "Writing files via tee is not allowed. Use write/edit tool instead." }
        }
        if (sedInlinePattern.test(cmd)) {
          return { approved: false, reason: "Inline file editing via sed -i is not allowed. Use edit tool instead." }
        }
        if (ddWritePattern.test(cmd)) {
          return { approved: false, reason: "Writing files via dd is not allowed. Use write/edit tool instead." }
        }
        if (cpMvPattern.test(cmd)) {
          return { approved: false, reason: "Copying/moving files via cp/mv is not allowed. Use filesystem_move_file or write/edit tool instead." }
        }
      }

      const r = runHook(w, "permission-auto-approve.js", { tool: event.tool, command: cmd }, 3000)
      if (r.approved) return { approved: true, reason: r.reason as string }
      return { approved: undefined }
    },

    tool: {
      run_tests: runTests,
      check_coverage: checkCoverage,
      security_audit: securityAudit,
      format_code: formatCode,
      lint_check: lintCheck,
      git_summary: gitSummary,
      changed_files: listChangedFiles,
      agent_metrics: agentMetrics,
    },
  }
}

export default AgentHooksPlugin
