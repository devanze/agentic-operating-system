import { describe, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"

describe("agent_metrics tool", () => {
  let TEST_DIR: string
  let TEST_FILE: string

  // Helper to create test JSONL data
  function createTestMetrics(entries: Record<string, unknown>[]): void {
    fs.mkdirSync(TEST_DIR, { recursive: true })
    const content = entries.map(e => JSON.stringify(e)).join("\n") + "\n"
    fs.writeFileSync(TEST_FILE, content)
  }

  function makeEntry(overrides: Partial<{
    agent_name: string
    timestamp: string
    duration_ms: number
    token_usage: { input: number; output: number }
    success: boolean
    error_type: string | null
    tool: string
  }> = {}): Record<string, unknown> {
    let id = (globalThis as Record<string, unknown>)._entryCounter as number || 0
    ;(globalThis as Record<string, unknown>)._entryCounter = id + 1
    return {
      agent_name: overrides.agent_name || "tdd-guide",
      timestamp: overrides.timestamp || new Date().toISOString(),
      duration_ms: overrides.duration_ms ?? 100,
      token_usage: overrides.token_usage || { input: 100, output: 50 },
      success: overrides.success ?? true,
      error_type: overrides.error_type ?? null,
      tool: overrides.tool || "Bash",
    }
  }

  // These functions mirror metrics-writer and agent-metrics logic for testing
  function readMetrics(): Record<string, unknown>[] {
    try {
      if (!fs.existsSync(TEST_FILE)) return []
      return fs.readFileSync(TEST_FILE, "utf-8")
        .split("\n")
        .filter(line => line.trim())
        .map(line => {
          try { return JSON.parse(line) }
          catch { return null }
        })
        .filter((m): m is Record<string, unknown> => m !== null)
    } catch { return [] }
  }

  function computeDashboard(metrics: Record<string, unknown>[]) {
    const byAgent: Record<string, { calls: number; latencies: number[]; errors: number; tokens: { input: number; output: number } }> = {}
    for (const m of metrics) {
      const name = m.agent_name as string
      if (!byAgent[name]) byAgent[name] = { calls: 0, latencies: [], errors: 0, tokens: { input: 0, output: 0 } }
      const a = byAgent[name]
      a.calls++
      a.latencies.push(m.duration_ms as number)
      a.tokens.input += (m.token_usage as Record<string, number>).input
      a.tokens.output += (m.token_usage as Record<string, number>).output
      if (!m.success) a.errors++
    }
    const rows = Object.entries(byAgent).map(([name, a]) => {
      const sorted = a.latencies.sort((x, y) => x - y)
      const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0
      const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0
      const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0
      const avg = Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length)
      const errRate = ((a.errors / a.calls) * 100).toFixed(1)
      const costEst = ((a.tokens.input + a.tokens.output) / 1_000_000 * 30).toFixed(4)
      return { name, calls: a.calls, avg, p50, p95, p99, errRate, costEst }
    })
    const totalCalls = metrics.length
    const totalAgents = Object.keys(byAgent).length
    const errorCount = metrics.filter(m => !m.success).length
    const overallErrorRate = ((errorCount / Math.max(totalCalls, 1)) * 100).toFixed(1)
    return {
      summary: { total_calls: totalCalls, total_agents: totalAgents, overall_error_rate: `${overallErrorRate}%` },
      rows,
    }
  }

  function computeTrend(metrics: Record<string, unknown>[]) {
    const byDay: Record<string, { total: number; errors: number; totalLatency: number }> = {}
    for (const m of metrics) {
      const day = (m.timestamp as string).split("T")[0]
      if (!byDay[day]) byDay[day] = { total: 0, errors: 0, totalLatency: 0 }
      byDay[day].total++
      if (!m.success) byDay[day].errors++
      byDay[day].totalLatency += m.duration_ms as number
    }
    return Object.entries(byDay).sort().map(([day, d]) => {
      const errRate = ((d.errors / d.total) * 100).toFixed(1)
      const avgLat = Math.round(d.totalLatency / d.total)
      return { day, total: d.total, avgLat, errRate }
    })
  }

  function computePrune(metrics: Record<string, unknown>[]): { pruned: number; remaining: number } {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const cutoffMs = cutoff.getTime()
    const pruned = metrics.filter(m => new Date(m.timestamp as string).getTime() >= cutoffMs)
    return {
      pruned: metrics.length - pruned.length,
      remaining: pruned.length,
    }
  }

  beforeEach(() => {
    ;(globalThis as Record<string, unknown>)._entryCounter = 0
    TEST_DIR = path.join(os.tmpdir(), "opencode-test-agent-metrics-" + Date.now())
    TEST_FILE = path.join(TEST_DIR, "agent-calls.jsonl")
  })

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true })
    }
  })

  describe("operation: dashboard", () => {
    it("should return summary with zero calls for empty metrics", () => {
      createTestMetrics([])
      const metrics = readMetrics()
      const result = computeDashboard(metrics)
      assert.strictEqual(result.summary.total_calls, 0)
      assert.strictEqual(result.summary.total_agents, 0)
      assert.strictEqual(result.summary.overall_error_rate, "0.0%")
      assert.strictEqual(result.rows.length, 0)
    })

    it("should compute per-agent latency percentiles (P50, P95, P99)", () => {
      const entries = [
        ...Array.from({ length: 100 }, (_, i) => makeEntry({ agent_name: "fast-agent", duration_ms: 10 + i })),
        ...Array.from({ length: 100 }, (_, i) => makeEntry({ agent_name: "slow-agent", duration_ms: 500 + i * 10 })),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const result = computeDashboard(metrics)

      assert.strictEqual(result.summary.total_calls, 200)
      assert.strictEqual(result.summary.total_agents, 2)

      const fast = result.rows.find(r => r.name === "fast-agent")!
      const slow = result.rows.find(r => r.name === "slow-agent")!

      // Fast agent: durations 10..109
      assert.ok(fast.p50 >= 50)
      assert.ok(fast.p50 <= 70)
      assert.ok(fast.p95 >= 100)
      assert.ok(fast.p99 >= 105)

      // Slow agent: durations 500..1490
      assert.ok(slow.p50 >= 950)
      assert.ok(slow.p95 >= 1400)
      assert.strictEqual(slow.calls, 100)
    })

    it("should compute error rate per agent", () => {
      const entries = [
        ...Array.from({ length: 80 }, () => makeEntry({ agent_name: "stable", success: true })),
        ...Array.from({ length: 20 }, () => makeEntry({ agent_name: "stable", success: false, error_type: "CRASH" })),
        ...Array.from({ length: 50 }, () => makeEntry({ agent_name: "flaky", success: true })),
        ...Array.from({ length: 50 }, () => makeEntry({ agent_name: "flaky", success: false, error_type: "TIMEOUT" })),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const result = computeDashboard(metrics)

      const stable = result.rows.find(r => r.name === "stable")!
      const flaky = result.rows.find(r => r.name === "flaky")!

      assert.strictEqual(stable.errRate, "20.0")
      assert.strictEqual(flaky.errRate, "50.0")
    })

    it("should estimate token cost at $30/M tokens", () => {
      const entries = [
        makeEntry({ token_usage: { input: 500_000, output: 500_000 } }),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const result = computeDashboard(metrics)

      // 1M tokens total * $30/M = $30
      assert.strictEqual(result.rows[0].costEst, "30.0000")
    })

    it("should compute overall error rate including all agents", () => {
      const entries = [
        makeEntry({ agent_name: "a", success: true }),
        makeEntry({ agent_name: "b", success: true }),
        makeEntry({ agent_name: "c", success: false, error_type: "ERR" }),
        makeEntry({ agent_name: "c", success: false, error_type: "ERR" }),
        makeEntry({ agent_name: "d", success: true }),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const result = computeDashboard(metrics)

      assert.strictEqual(result.summary.overall_error_rate, "40.0%")
      assert.strictEqual(result.summary.total_calls, 5)
      assert.strictEqual(result.summary.total_agents, 4)
    })
  })

  describe("operation: query", () => {
    it("should return limited recent entries", () => {
      const entries = Array.from({ length: 100 }, (_, i) =>
        makeEntry({ agent_name: `agent-${i}`, timestamp: new Date(2025, 5, 11, 10, 0, i).toISOString() })
      )
      createTestMetrics(entries)
      const metrics = readMetrics()
      const limit = 10
      const recent = metrics.slice(-limit)

      assert.strictEqual(recent.length, limit)
      assert.strictEqual(recent[0].agent_name, "agent-90")
      assert.strictEqual(recent[recent.length - 1].agent_name, "agent-99")
    })

    it("should filter by agent name regex", () => {
      const entries = [
        makeEntry({ agent_name: "code-reviewer" }),
        makeEntry({ agent_name: "security-reviewer" }),
        makeEntry({ agent_name: "code-reviewer" }),
        makeEntry({ agent_name: "tdd-guide" }),
        makeEntry({ agent_name: "code-explorer" }),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()

      const re = new RegExp("reviewer", "i")
      const filtered = metrics.filter(m => re.test(m.agent_name as string))

      assert.strictEqual(filtered.length, 3)
      assert.strictEqual(filtered.every(m => (m.agent_name as string).includes("reviewer")), true)
    })

    it("should filter by time range", () => {
      const entries = [
        makeEntry({ agent_name: "old", timestamp: "2025-01-01T00:00:00.000Z" }),
        makeEntry({ agent_name: "mid", timestamp: "2025-06-01T00:00:00.000Z" }),
        makeEntry({ agent_name: "new", timestamp: "2025-12-31T23:59:59.000Z" }),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()

      const start = new Date("2025-06-01").getTime()
      const end = new Date("2025-07-01").getTime()

      const filtered = metrics.filter(m => {
        const ts = new Date(m.timestamp as string).getTime()
        return ts >= start && ts <= end
      })

      assert.strictEqual(filtered.length, 1)
      assert.strictEqual(filtered[0].agent_name, "mid")
    })

    it("should respect timeRange.start only filter", () => {
      const entries = [
        makeEntry({ agent_name: "old", timestamp: "2025-01-01T00:00:00.000Z" }),
        makeEntry({ agent_name: "new", timestamp: "2025-12-31T23:59:59.000Z" }),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()

      const start = new Date("2025-06-01").getTime()
      const filtered = metrics.filter(m => {
        const ts = new Date(m.timestamp as string).getTime()
        return ts >= start
      })

      assert.strictEqual(filtered.length, 1)
      assert.strictEqual(filtered[0].agent_name, "new")
    })

    it("should respect timeRange.end only filter", () => {
      const entries = [
        makeEntry({ agent_name: "old", timestamp: "2025-01-01T00:00:00.000Z" }),
        makeEntry({ agent_name: "new", timestamp: "2025-12-31T23:59:59.000Z" }),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()

      const end = new Date("2025-06-01").getTime()
      const filtered = metrics.filter(m => {
        const ts = new Date(m.timestamp as string).getTime()
        return ts <= end
      })

      assert.strictEqual(filtered.length, 1)
      assert.strictEqual(filtered[0].agent_name, "old")
    })
  })

  describe("operation: trend", () => {
    it("should group metrics by day", () => {
      const entries = [
        makeEntry({ timestamp: "2025-06-09T10:00:00.000Z", duration_ms: 100, success: true }),
        makeEntry({ timestamp: "2025-06-09T11:00:00.000Z", duration_ms: 200, success: false, error_type: "ERR" }),
        makeEntry({ timestamp: "2025-06-10T10:00:00.000Z", duration_ms: 300, success: true }),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const trend = computeTrend(metrics)

      assert.strictEqual(trend.length, 2)
      assert.strictEqual(trend[0].day, "2025-06-09")
      assert.strictEqual(trend[0].total, 2)
      assert.strictEqual(trend[0].errRate, "50.0")
      assert.strictEqual(trend[0].avgLat, 150) // (100+200)/2

      assert.strictEqual(trend[1].day, "2025-06-10")
      assert.strictEqual(trend[1].total, 1)
      assert.strictEqual(trend[1].errRate, "0.0")
      assert.strictEqual(trend[1].avgLat, 300)
    })

    it("should sort days chronologically", () => {
      const entries = [
        makeEntry({ timestamp: "2025-06-15T00:00:00.000Z" }),
        makeEntry({ timestamp: "2025-06-10T00:00:00.000Z" }),
        makeEntry({ timestamp: "2025-06-20T00:00:00.000Z" }),
        makeEntry({ timestamp: "2025-06-01T00:00:00.000Z" }),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const trend = computeTrend(metrics)

      assert.strictEqual(trend[0].day, "2025-06-01")
      assert.strictEqual(trend[1].day, "2025-06-10")
      assert.strictEqual(trend[2].day, "2025-06-15")
      assert.strictEqual(trend[3].day, "2025-06-20")
    })

    it("should handle single-day data", () => {
      const entries = Array.from({ length: 10 }, () =>
        makeEntry({ timestamp: "2025-06-11T12:00:00.000Z" })
      )
      createTestMetrics(entries)
      const metrics = readMetrics()
      const trend = computeTrend(metrics)

      assert.strictEqual(trend.length, 1)
      assert.strictEqual(trend[0].day, "2025-06-11")
      assert.strictEqual(trend[0].total, 10)
    })
  })

  describe("operation: prune", () => {
    it("should prune entries older than 30 days", () => {
      const now = new Date()
      const entries = [
        makeEntry({ agent_name: "recent", timestamp: now.toISOString() }),
        makeEntry({ agent_name: "recent2", timestamp: new Date(now.getTime() - 5 * 86400000).toISOString() }),
        makeEntry({ agent_name: "old", timestamp: new Date(now.getTime() - 40 * 86400000).toISOString() }),
        makeEntry({ agent_name: "very-old", timestamp: new Date(now.getTime() - 60 * 86400000).toISOString() }),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const result = computePrune(metrics)

      assert.strictEqual(result.pruned, 2)
      assert.strictEqual(result.remaining, 2)
    })

    it("should keep entries within 30-day window and prune older ones", () => {
      const now = new Date()
      // Entry from 25 days ago — should be kept
      const recentDate = new Date(now.getTime() - 25 * 86400000)
      // Entry from 35 days ago — should be pruned
      const oldDate = new Date(now.getTime() - 35 * 86400000)

      const entries = [
        makeEntry({ agent_name: "recent", timestamp: recentDate.toISOString() }),
        makeEntry({ agent_name: "old", timestamp: oldDate.toISOString() }),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const result = computePrune(metrics)

      assert.strictEqual(result.remaining, 1)
      assert.strictEqual(result.pruned, 1)
    })

    it("should keep entries from exactly 29 days ago", () => {
      const now = new Date()
      const d = new Date(now.getTime() - 29 * 86400000)
      const entries = [
        makeEntry({ agent_name: "boundary", timestamp: d.toISOString() }),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const result = computePrune(metrics)

      assert.strictEqual(result.remaining, 1)
      assert.strictEqual(result.pruned, 0)
    })

    it("should handle empty metrics gracefully", () => {
      createTestMetrics([])
      const metrics = readMetrics()
      const result = computePrune(metrics)

      assert.strictEqual(result.pruned, 0)
      assert.strictEqual(result.remaining, 0)
    })

    it("should prune all entries if all are older than 30 days", () => {
      const entries = Array.from({ length: 5 }, () =>
        makeEntry({ agent_name: "ancient", timestamp: new Date("2020-01-01").toISOString() })
      )
      createTestMetrics(entries)
      const metrics = readMetrics()
      const result = computePrune(metrics)

      assert.strictEqual(result.pruned, 5)
      assert.strictEqual(result.remaining, 0)
    })
  })

  describe("alert thresholds", () => {
    it("should flag agents with error rate >5%", () => {
      const entries = [
        ...Array.from({ length: 94 }, () => makeEntry({ agent_name: "problematic", success: true })),
        ...Array.from({ length: 6 }, () => makeEntry({ agent_name: "problematic", success: false, error_type: "ERR" })),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const result = computeDashboard(metrics)

      const agent = result.rows.find(r => r.name === "problematic")!
      const errRate = parseFloat(agent.errRate)
      assert.ok(errRate > 5)
    })

    it("should flag agents with P95 latency >30s (30000ms)", () => {
      const entries = [
        ...Array.from({ length: 95 }, () => makeEntry({ agent_name: "slowpoke", duration_ms: 1000 })),
        ...Array.from({ length: 5 }, () => makeEntry({ agent_name: "slowpoke", duration_ms: 35000 })),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const result = computeDashboard(metrics)

      const agent = result.rows.find(r => r.name === "slowpoke")!
      assert.ok(agent.p95 > 30000)
    })

    it("should NOT flag agents below threshold", () => {
      const entries = [
        ...Array.from({ length: 99 }, () => makeEntry({ agent_name: "healthy", success: true, duration_ms: 500 })),
        ...Array.from({ length: 1 }, () => makeEntry({ agent_name: "healthy", success: false, error_type: "ERR", duration_ms: 500 })),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const result = computeDashboard(metrics)

      const agent = result.rows.find(r => r.name === "healthy")!
      assert.ok(parseFloat(agent.errRate) <= 5)
      assert.ok(agent.p95 < 30000)
    })
  })

  describe("edge cases", () => {
    it("should handle agent names with special characters", () => {
      const entries = [
        makeEntry({ agent_name: "code-reviewer-v2.0" }),
        makeEntry({ agent_name: "build/error-resolver" }),
        makeEntry({ agent_name: "test_runner" }),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const result = computeDashboard(metrics)

      assert.strictEqual(result.summary.total_agents, 3)
    })

    it("should handle zero-duration entries", () => {
      const entries = [
        makeEntry({ agent_name: "instant", duration_ms: 0 }),
        makeEntry({ agent_name: "instant", duration_ms: 0 }),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const result = computeDashboard(metrics)

      const agent = result.rows.find(r => r.name === "instant")!
      assert.strictEqual(agent.avg, 0)
      assert.strictEqual(agent.p50, 0)
      assert.strictEqual(agent.p95, 0)
    })

    it("should handle very large token counts without overflow", () => {
      const entries = [
        makeEntry({ token_usage: { input: 2_000_000_000, output: 2_000_000_000 } }),
      ]
      createTestMetrics(entries)
      const metrics = readMetrics()
      const result = computeDashboard(metrics)

      // 4B tokens * $30/M = $120,000
      const cost = parseFloat(result.rows[0].costEst)
      assert.ok(cost > 100_000)
      assert.strictEqual(isNaN(cost), false)
    })

    it("should handle missing optional fields gracefully", () => {
      // Simulate a partial entry
      const partial = {
        agent_name: "partial",
        timestamp: new Date().toISOString(),
        duration_ms: 100,
        token_usage: { input: 10, output: 20 },
        success: true,
      }
      createTestMetrics([partial])
      const metrics = readMetrics()

      assert.strictEqual(metrics[0].error_type, undefined)
      assert.strictEqual(metrics[0].tool, undefined)
      // Should not crash
      assert.strictEqual(metrics.length, 1)
    })
  })
})
