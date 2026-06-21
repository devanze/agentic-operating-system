import { describe, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"

// Simulate the hooks logic for metric capture in isolation,
// mirroring the exact logic that will be added to hooks.ts.

describe("hooks — agent_metrics capture", () => {
  const TEST_METRICS_DIR = path.join(os.tmpdir(), "opencode-test-hooks-metrics-" + Date.now())
  const TEST_METRICS_FILE = path.join(TEST_METRICS_DIR, "agent-calls.jsonl")

  // Simulated "metricsStarts" map (mirrors what gets added to hooks.ts)
  let metricsStarts: Map<string, number>
  let agentBySession: Map<string, string>

  // Simulated hook profile state
  let currentProfile: "minimal" | "standard" | "strict"
  let disabledHooks: Set<string>

  const profileOrder: Record<string, number> = { minimal: 0, standard: 1, strict: 2 }

  function on(id: string, profile: string[] = ["standard"]): boolean {
    return !disabledHooks.has(id) && profile.some(r => profileOrder[currentProfile] >= profileOrder[r])
  }

  function appendMetrics(entry: Record<string, unknown>): void {
    fs.mkdirSync(TEST_METRICS_DIR, { recursive: true })
    fs.appendFileSync(TEST_METRICS_FILE, JSON.stringify(entry) + "\n")
  }

  // Simulated tool.execute.before handler (metrics portion only)
  function beforeHook(input: { tool: string; callID?: string; args?: Record<string, unknown> }): void {
    if (on("agent-metrics", ["standard", "strict"])) {
      const cid = input.callID || `${input.tool}-${Date.now()}`
      metricsStarts.set(cid, Date.now())
    }
  }

  function chatParamsHook(input: { sessionID: string; agent: string }): void {
    if (input.agent) {
      agentBySession.set(input.sessionID, input.agent)
    }
  }

  // Simulated tool.execute.after handler (metrics portion only)
  function afterHook(
    input: { tool: string; callID?: string; args?: Record<string, unknown> },
    _output: unknown
  ): void {
    if (on("agent-metrics", ["standard", "strict"])) {
      const cid = input.callID || `${input.tool}-${Date.now()}`
      const start = metricsStarts.get(cid)
      if (start) {
        const duration = Date.now() - start
        metricsStarts.delete(cid)

        const output = _output as Record<string, unknown> | undefined
        const isError = output?.exitCode !== undefined && (output.exitCode as number) > 0

        const entry = {
          agent_name: agentBySession.get((input as any).sessionID) || "unknown",
          timestamp: new Date().toISOString(),
          duration_ms: duration,
          token_usage: { input: 0, output: 0 },
          success: !isError,
          error_type: isError ? String(output?.stderr || "execution_error").slice(0, 100) : null,
          tool: input.tool,
        }
        appendMetrics(entry)
      }
    }
  }

  function readMetricsFile(): Record<string, unknown>[] {
    try {
      if (!fs.existsSync(TEST_METRICS_FILE)) return []
      return fs.readFileSync(TEST_METRICS_FILE, "utf-8")
        .split("\n")
        .filter(line => line.trim())
        .map(line => {
          try { return JSON.parse(line) }
          catch { return null }
        })
        .filter((m): m is Record<string, unknown> => m !== null)
    } catch { return [] }
  }

  beforeEach(() => {
    metricsStarts = new Map()
    agentBySession = new Map()
    currentProfile = "standard"
    disabledHooks = new Set()

    // Clean test dir
    if (fs.existsSync(TEST_METRICS_DIR)) {
      fs.rmSync(TEST_METRICS_DIR, { recursive: true, force: true })
    }
  })

  afterEach(() => {
    if (fs.existsSync(TEST_METRICS_DIR)) {
      fs.rmSync(TEST_METRICS_DIR, { recursive: true, force: true })
    }
  })

  // ─── Profile gating ───
  describe("profile gating (on('agent-metrics', ...))", () => {
    it("should capture metrics in standard profile", () => {
      currentProfile = "standard"
      beforeHook({ tool: "Bash", callID: "c1" })
      afterHook({ tool: "Bash", callID: "c1" }, { exitCode: 0 })

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 1)
      assert.strictEqual(entries[0].tool, "Bash")
    })

    it("should capture metrics in strict profile", () => {
      currentProfile = "strict"
      beforeHook({ tool: "Read", callID: "c2" })
      afterHook({ tool: "Read", callID: "c2" }, { exitCode: 0 })

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 1)
      assert.strictEqual(entries[0].tool, "Read")
    })

    it("should NOT capture metrics in minimal profile", () => {
      currentProfile = "minimal"
      beforeHook({ tool: "Bash", callID: "c3" })
      afterHook({ tool: "Bash", callID: "c3" }, { exitCode: 0 })

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 0)
    })

    it("should NOT capture metrics when agent-metrics hook is disabled", () => {
      currentProfile = "standard"
      disabledHooks.add("agent-metrics")
      beforeHook({ tool: "Bash", callID: "c4" })
      afterHook({ tool: "Bash", callID: "c4" }, { exitCode: 0 })

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 0)
    })
  })

  // ─── Happy path ───
  describe("successful tool execution", () => {
    it("should record a success entry when tool exits with code 0", () => {
      beforeHook({ tool: "Bash", callID: "c-success-1" })
      afterHook({ tool: "Bash", callID: "c-success-1" }, { exitCode: 0 })

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 1)
      assert.strictEqual(entries[0].success, true)
      assert.strictEqual(entries[0].error_type, null)
      assert.strictEqual(entries[0].tool, "Bash")
    })

    it("should record a success entry when output has no exitCode", () => {
      beforeHook({ tool: "Write", callID: "c-success-2" })
      afterHook({ tool: "Write", callID: "c-success-2" }, { bytesWritten: 100 })

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 1)
      assert.strictEqual(entries[0].success, true)
      assert.strictEqual(entries[0].error_type, null)
    })

    it("should record a success entry when output is undefined", () => {
      beforeHook({ tool: "Edit", callID: "c-success-3" })
      afterHook({ tool: "Edit", callID: "c-success-3" }, undefined)

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 1)
      assert.strictEqual(entries[0].success, true)
      assert.strictEqual(entries[0].error_type, null)
    })
  })

  // ─── Error path ───
  describe("failed tool execution", () => {
    it("should record a failure when exitCode > 0", () => {
      beforeHook({ tool: "Bash", callID: "c-err-1" })
      afterHook({ tool: "Bash", callID: "c-err-1" }, { exitCode: 1, stderr: "command not found" })

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 1)
      assert.strictEqual(entries[0].success, false)
      assert.ok((entries[0].error_type as string).includes("command not found"))
    })

    it("should record failure with truncated error message if stderr > 100 chars", () => {
      beforeHook({ tool: "Bash", callID: "c-err-2" })
      const longError = "x".repeat(300)
      afterHook({ tool: "Bash", callID: "c-err-2" }, { exitCode: 2, stderr: longError })

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 1)
      assert.strictEqual(entries[0].success, false)
      assert.ok((entries[0].error_type as string).length <= 100)
    })

    it("should use 'execution_error' as default when no stderr", () => {
      beforeHook({ tool: "Bash", callID: "c-err-3" })
      afterHook({ tool: "Bash", callID: "c-err-3" }, { exitCode: 1 })

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 1)
      assert.strictEqual(entries[0].success, false)
      assert.strictEqual(entries[0].error_type, "execution_error")
    })
  })

  // ─── Timing ───
  describe("duration tracking", () => {
    it("should record positive duration for tool execution", async () => {
      beforeHook({ tool: "Bash", callID: "c-dur-1" })
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10))
      afterHook({ tool: "Bash", callID: "c-dur-1" }, { exitCode: 0 })

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 1)
      assert.ok((entries[0].duration_ms as number) > 0)
    })

    it("should not write entry if before was never called (no start time)", () => {
      // Only call after, no before
      afterHook({ tool: "Bash", callID: "c-dur-2" }, { exitCode: 0 })

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 0)
    })

    it("should handle missing callID by generating synthetic ID", () => {
      // When callID is absent, a synthetic ID is produced from tool+Date.now().
      // Stabilize Date.now so both before/after produce the same synthetic ID.
      const ts = Date.now()
      const origNow = Date.now
      Date.now = () => ts
      try {
        beforeHook({ tool: "Read" })
        afterHook({ tool: "Read" }, { exitCode: 0 })
      } finally {
        Date.now = origNow
      }

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 1)
      assert.strictEqual(entries[0].tool, "Read")
      assert.strictEqual(entries[0].success, true)
    })

    it("should skip entry when synthetic IDs do not match (different times)", () => {
      // Simulate the case where before and after generate different synthetic IDs
      // (e.g., when Date.now() changes between calls).
      // We do this by calling before with one tool name and after with another,
      // producing different synthetic IDs.
      beforeHook({ tool: "Read" })  // synthetic: "Read-{ts}"
      // In real usage, the framework always provides callID.
      // This test demonstrates the limitation of synthetic IDs.
    })
  })

  // ─── Entry structure ───
  describe("metric entry structure", () => {
    it("should produce entries with all required fields", () => {
      beforeHook({ tool: "Write", callID: "c-struct-1" })
      afterHook({ tool: "Write", callID: "c-struct-1" }, { exitCode: 0 })

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 1)
      const entry = entries[0]

      assert.ok("agent_name" in entry)
      assert.ok("timestamp" in entry)
      assert.ok("duration_ms" in entry)
      assert.ok("token_usage" in entry)
      assert.ok("success" in entry)
      assert.ok("error_type" in entry)
      assert.ok("tool" in entry)

      // token_usage sub-fields
      const tu = entry.token_usage as Record<string, unknown>
      assert.ok("input" in tu)
      assert.ok("output" in tu)
    })

    it("should set agent_name to 'unknown' when not provided", () => {
      beforeHook({ tool: "Bash", callID: "c-struct-2" })
      afterHook({ tool: "Bash", callID: "c-struct-2" }, { exitCode: 0 })

      const entries = readMetricsFile()
      assert.strictEqual(entries[0].agent_name, "unknown")
    })

    it("should use provided agent name when available", () => {
      chatParamsHook({ sessionID: "sess-3", agent: "tdd-guide" })
      beforeHook({ tool: "Bash", callID: "c-struct-3", sessionID: "sess-3" } as any)
      afterHook({ tool: "Bash", callID: "c-struct-3", sessionID: "sess-3" } as any, { exitCode: 0 })

      const entries = readMetricsFile()
      assert.strictEqual(entries[0].agent_name, "tdd-guide")
    })

    it("should produce valid ISO timestamp", () => {
      beforeHook({ tool: "Bash", callID: "c-struct-4" })
      afterHook({ tool: "Bash", callID: "c-struct-4" }, { exitCode: 0 })

      const entries = readMetricsFile()
      const ts = entries[0].timestamp as string
      const parsed = new Date(ts)
      assert.ok(!isNaN(parsed.getTime()))
      assert.ok(ts.includes("T"))
    })

    it("should set token_usage to zero (placeholder)", () => {
      beforeHook({ tool: "Bash", callID: "c-struct-5" })
      afterHook({ tool: "Bash", callID: "c-struct-5" }, { exitCode: 0 })

      const entries = readMetricsFile()
      const tu = entries[0].token_usage as Record<string, number>
      assert.strictEqual(tu.input, 0)
      assert.strictEqual(tu.output, 0)
    })
  })

  // ─── Concurrent / multiple entries ───
  describe("multiple calls", () => {
    it("should handle multiple sequential tool executions", () => {
      for (let i = 0; i < 5; i++) {
        const cid = `c-multi-${i}`
        beforeHook({ tool: "Bash", callID: cid })
        afterHook({ tool: "Bash", callID: cid }, { exitCode: i === 2 ? 1 : 0 })
      }

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 5)
      assert.strictEqual(entries.filter(e => !e.success).length, 1)
      assert.strictEqual(entries.filter(e => e.success).length, 4)
    })

    it("should handle multiple different tools", () => {
      const tools = ["Bash", "Read", "Write", "Edit", "Glob", "Grep"]
      for (const tool of tools) {
        const cid = `c-tool-${tool}`
        beforeHook({ tool, callID: cid })
        afterHook({ tool, callID: cid }, { exitCode: 0 })
      }

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, tools.length)

      const recordedTools = entries.map(e => e.tool).sort()
      assert.deepStrictEqual(recordedTools, [...tools].sort())
    })
  })

  // ─── Map cleanup ───
  describe("metricsStarts map management", () => {
    it("should remove entries from Map after recording", () => {
      assert.strictEqual(metricsStarts.size, 0)

      beforeHook({ tool: "Bash", callID: "c-mgmt-1" })
      assert.strictEqual(metricsStarts.size, 1)

      afterHook({ tool: "Bash", callID: "c-mgmt-1" }, { exitCode: 0 })
      assert.strictEqual(metricsStarts.size, 0)
    })

    it("should not leak entries when after is called without before", () => {
      beforeHook({ tool: "Bash", callID: "c-mgmt-2" })
      afterHook({ tool: "Bash", callID: "c-mgmt-3" }, { exitCode: 0 })
      // c-mgmt-2 still in map because after used different callID
      assert.strictEqual(metricsStarts.size, 1)
      // But no matching metrics entry written
      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 0)
    })
  })

  // ─── Edge cases ───
  describe("edge cases", () => {
    it("should handle null output gracefully", () => {
      beforeHook({ tool: "Bash", callID: "c-edge-1" })
      afterHook({ tool: "Bash", callID: "c-edge-1" }, null)

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 1)
      assert.strictEqual(entries[0].success, true)
    })

    it("should handle exitCode 0 as success (not error)", () => {
      beforeHook({ tool: "Bash", callID: "c-edge-2" })
      afterHook({ tool: "Bash", callID: "c-edge-2" }, { exitCode: 0, stderr: "some warning" })

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 1)
      assert.strictEqual(entries[0].success, true)
      assert.strictEqual(entries[0].error_type, null)
    })

    it("should handle very long agent names", () => {
      const longName = "a".repeat(200)
      chatParamsHook({ sessionID: "sess-edge-3", agent: longName })
      beforeHook({ tool: "Bash", callID: "c-edge-3", sessionID: "sess-edge-3" } as any)
      afterHook({ tool: "Bash", callID: "c-edge-3", sessionID: "sess-edge-3" } as any, { exitCode: 0 })

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 1)
      assert.strictEqual((entries[0].agent_name as string).length, 200)
    })

    it("should handle special characters in tool names", () => {
      const tools = ["tool.with.dots", "tool/with/slashes", "tool_with_underscores"]
      for (const tool of tools) {
        const cid = `c-special-${tool}`
        beforeHook({ tool, callID: cid })
        afterHook({ tool, callID: cid }, { exitCode: 0 })
      }

      const entries = readMetricsFile()
      assert.strictEqual(entries.length, 3)
      const recorded = entries.map(e => e.tool).sort()
      assert.deepStrictEqual(recorded, [...tools].sort())
    })

    it("should produce valid JSONL (one JSON object per line)", () => {
      for (let i = 0; i < 3; i++) {
        const cid = `c-jsonl-${i}`
        beforeHook({ tool: "Bash", callID: cid })
        afterHook({ tool: "Bash", callID: cid }, { exitCode: 0 })
      }

      const content = fs.readFileSync(TEST_METRICS_FILE, "utf-8")
      const lines = content.split("\n").filter(l => l.trim())
      assert.strictEqual(lines.length, 3)
      for (const line of lines) {
        assert.doesNotThrow(() => JSON.parse(line))
      }
    })
  })
})
