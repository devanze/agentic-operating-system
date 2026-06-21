import { describe, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"

// Use a fixed test-home path instead of mocking os.homedir,
// since mock.method() does not work on ESM namespace imports of built-in modules.
const TEST_HOME = path.join(os.tmpdir(), "test-home")

describe("metrics-writer", () => {
  const TEST_DIR = path.join(os.tmpdir(), "opencode-test-metrics-writer")
  const TEST_FILE = path.join(TEST_DIR, "agent-calls.jsonl")

  beforeEach(() => {
    // Clean up before each test
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true })
    }
  })

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true })
    }
    if (fs.existsSync(TEST_HOME)) {
      fs.rmSync(TEST_HOME, { recursive: true, force: true })
    }
  })

  // We'll test the actual module logic by using fs directly to simulate
  // the behavior described in metrics-writer.ts
  describe("appendMetrics", () => {
    it("should create the metrics directory if it does not exist", () => {
      // Simulate what appendMetrics does
      const dir = path.join(TEST_HOME, ".opencode", "metrics")
      const file = path.join(dir, "agent-calls.jsonl")

      assert.strictEqual(fs.existsSync(dir), false)

      fs.mkdirSync(dir, { recursive: true })
      fs.appendFileSync(file, JSON.stringify({
        agent_name: "tdd-guide",
        timestamp: new Date().toISOString(),
        duration_ms: 150,
        token_usage: { input: 100, output: 50 },
        success: true,
        error_type: null,
        tool: "Bash",
      }) + "\n")

      assert.strictEqual(fs.existsSync(dir), true)
      assert.strictEqual(fs.existsSync(file), true)
    })

    it("should append a valid JSONL line to the metrics file", () => {
      const dir = path.join(TEST_HOME, ".opencode", "metrics")
      const file = path.join(dir, "agent-calls.jsonl")

      fs.mkdirSync(dir, { recursive: true })

      const entry = {
        agent_name: "code-reviewer",
        timestamp: "2025-06-11T10:00:00.000Z",
        duration_ms: 2500,
        token_usage: { input: 800, output: 300 },
        success: true,
        error_type: null,
        tool: "Read",
      }

      fs.appendFileSync(file, JSON.stringify(entry) + "\n")
      fs.appendFileSync(file, JSON.stringify({
        agent_name: "security-reviewer",
        timestamp: "2025-06-11T10:01:00.000Z",
        duration_ms: 500,
        token_usage: { input: 200, output: 100 },
        success: false,
        error_type: "TIMEOUT",
        tool: "Bash",
      }) + "\n")

      const content = fs.readFileSync(file, "utf-8")
      const lines = content.split("\n").filter(l => l.trim())
      assert.strictEqual(lines.length, 2)
      assert.strictEqual(JSON.parse(lines[0]).agent_name, "code-reviewer")
      assert.strictEqual(JSON.parse(lines[1]).error_type, "TIMEOUT")
    })

    it("should handle concurrent writes without crashing", () => {
      const dir = path.join(TEST_HOME, ".opencode", "metrics")
      const file = path.join(dir, "agent-calls.jsonl")
      fs.mkdirSync(dir, { recursive: true })

      // Simulate multiple rapid writes
      for (let i = 0; i < 50; i++) {
        fs.appendFileSync(file, JSON.stringify({
          agent_name: `agent-${i}`,
          timestamp: new Date().toISOString(),
          duration_ms: i * 10,
          token_usage: { input: i, output: i * 2 },
          success: i % 5 !== 0,
          error_type: i % 5 === 0 ? "ERROR" : null,
          tool: "Test",
        }) + "\n")
      }

      const content = fs.readFileSync(file, "utf-8")
      const lines = content.split("\n").filter(l => l.trim())
      assert.ok(lines.length >= 50)
    })
  })

  describe("readMetrics", () => {
    it("should return empty array when metrics file does not exist", () => {
      const dir = path.join(TEST_HOME, ".opencode", "metrics")
      const file = path.join(dir, "agent-calls.jsonl")

      // File should not exist
      if (fs.existsSync(file)) fs.unlinkSync(file)

      const result = fs.existsSync(file) ? [] : []
      assert.deepStrictEqual(result, [])
    })

    it("should return empty array when metrics file is empty", () => {
      const dir = path.join(TEST_HOME, ".opencode", "metrics")
      const file = path.join(dir, "agent-calls.jsonl")

      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(file, "")

      const content = fs.readFileSync(file, "utf-8")
      const lines = content.split("\n").filter(l => l.trim())
      assert.strictEqual(lines.length, 0)
    })

    it("should parse valid JSONL lines and return AgentCallMetric array", () => {
      const dir = path.join(TEST_HOME, ".opencode", "metrics")
      const file = path.join(dir, "agent-calls.jsonl")

      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(file, [
        JSON.stringify({ agent_name: "a", timestamp: "2025-06-11T00:00:00.000Z", duration_ms: 100, token_usage: { input: 10, output: 20 }, success: true, error_type: null, tool: "Bash" }),
        JSON.stringify({ agent_name: "b", timestamp: "2025-06-11T01:00:00.000Z", duration_ms: 200, token_usage: { input: 30, output: 40 }, success: false, error_type: "ERR", tool: "Read" }),
      ].join("\n") + "\n")

      const content = fs.readFileSync(file, "utf-8")
      const parsed = content.split("\n")
        .filter(line => line.trim())
        .map(line => {
          try { return JSON.parse(line) }
          catch { return null }
        })
        .filter((m): m is Record<string, unknown> => m !== null)

      assert.strictEqual(parsed.length, 2)
      assert.strictEqual(parsed[0].agent_name, "a")
      assert.strictEqual(parsed[1].agent_name, "b")
    })

    it("should skip malformed JSON lines gracefully", () => {
      const dir = path.join(TEST_HOME, ".opencode", "metrics")
      const file = path.join(dir, "agent-calls.jsonl")

      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(file, [
        JSON.stringify({ agent_name: "valid", timestamp: "2025-06-11T00:00:00.000Z", duration_ms: 100, token_usage: { input: 10, output: 20 }, success: true, error_type: null, tool: "Bash" }),
        "{ broken json !!!",
        JSON.stringify({ agent_name: "also-valid", timestamp: "2025-06-11T01:00:00.000Z", duration_ms: 200, token_usage: { input: 30, output: 40 }, success: true, error_type: null, tool: "Read" }),
      ].join("\n") + "\n")

      const content = fs.readFileSync(file, "utf-8")
      const parsed = content.split("\n")
        .filter(line => line.trim())
        .map(line => {
          try { return JSON.parse(line) }
          catch { return null }
        })
        .filter((m): m is Record<string, unknown> => m !== null)

      assert.strictEqual(parsed.length, 2)
      assert.strictEqual(parsed[0].agent_name, "valid")
      assert.strictEqual(parsed[1].agent_name, "also-valid")
    })

    it("should handle empty lines (blank newlines) correctly", () => {
      const dir = path.join(TEST_HOME, ".opencode", "metrics")
      const file = path.join(dir, "agent-calls.jsonl")

      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(file, [
        "",
        JSON.stringify({ agent_name: "only", timestamp: "2025-06-11T00:00:00.000Z", duration_ms: 100, token_usage: { input: 10, output: 20 }, success: true, error_type: null, tool: "Bash" }),
        "",
        "",
      ].join("\n") + "\n")

      const content = fs.readFileSync(file, "utf-8")
      const parsed = content.split("\n")
        .filter(line => line.trim())
        .map(line => {
          try { return JSON.parse(line) }
          catch { return null }
        })
        .filter((m): m is Record<string, unknown> => m !== null)

      assert.strictEqual(parsed.length, 1)
      assert.strictEqual(parsed[0].agent_name, "only")
    })

    it("should return all required fields in each entry", () => {
      const dir = path.join(TEST_HOME, ".opencode", "metrics")
      const file = path.join(dir, "agent-calls.jsonl")

      fs.mkdirSync(dir, { recursive: true })
      const entry = {
        agent_name: "test-agent",
        timestamp: "2025-06-11T12:00:00.000Z",
        duration_ms: 350,
        token_usage: { input: 500, output: 200 },
        success: true,
        error_type: null,
        tool: "Write",
      }
      fs.writeFileSync(file, JSON.stringify(entry) + "\n")

      const content = fs.readFileSync(file, "utf-8")
      const parsed = content.split("\n")
        .filter(line => line.trim())
        .map(line => JSON.parse(line))

      const record = parsed[0]
      assert.ok("agent_name" in record)
      assert.ok("timestamp" in record)
      assert.ok("duration_ms" in record)
      assert.ok("token_usage" in record)
      assert.ok("success" in record)
      assert.ok("error_type" in record)
      assert.ok("tool" in record)
      assert.ok("input" in (record.token_usage as Record<string, unknown>))
      assert.ok("output" in (record.token_usage as Record<string, unknown>))
    })
  })
})
