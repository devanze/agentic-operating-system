---
name: observability-pipeline
description: Observability pipeline for the opencode agent system covering metric collection (agent-calls.jsonl), dashboard aggregation (P50/P95/P99 latency, error rate, token cost), alert thresholds (error rate >5%, P95 latency >30s), 30-day data retention with auto-prune, and integration with token-optimizer MCP for cost correlation.
---

# Observability Pipeline

Observability pipeline for monitoring agent call metrics — latency distribution, error rates, token costs, and trend analysis across all agents in the system.

## Metric Collection

All agent calls are recorded to `~/.opencode/metrics/agent-calls.jsonl` via `metrics-writer.ts`. Each entry contains:

```typescript
interface AgentCallMetric {
  agent_name: string     // e.g. "tdd-guide", "code-reviewer"
  timestamp: string      // ISO 8601
  duration_ms: number    // Wall-clock call duration
  token_usage: {
    input: number        // Input tokens consumed
    output: number       // Output tokens generated
  }
  success: boolean       // Did the call complete without error?
  error_type: string | null  // "TIMEOUT", "CRASH", "PARSE_ERROR", null
  tool: string           // Tool used: "Bash", "Read", "Write", "Edit", etc.
}
```

**Usage:**
```typescript
import { appendMetrics } from "./tools/metrics-writer"

appendMetrics({
  agent_name: "code-reviewer",
  timestamp: new Date().toISOString(),
  duration_ms: 2500,
  token_usage: { input: 800, output: 300 },
  success: true,
  error_type: null,
  tool: "Read",
})
```

## Dashboard Aggregation

Use `agent_metrics` tool with `operation: "dashboard"` to get per-agent aggregation:

| Metric | Description |
|--------|-------------|
| **Calls** | Total calls per agent |
| **Avg** | Mean latency |
| **P50** | Median latency (50th percentile) |
| **P95** | 95th percentile latency |
| **P99** | 99th percentile latency |
| **Err%** | Error rate (failed/total * 100) |
| **EstCost** | Estimated cost at $30/M tokens |

**Example output:**
```
| Agent | Calls | Avg | P50 | P95 | P99 | Err% | EstCost |
|-------|-------|-----|-----|-----|-----|------|---------|
| tdd-guide | 150 | 3200ms | 2800ms | 8500ms | 12000ms | 2.5% | $1.2345 |
| code-reviewer | 200 | 4100ms | 3500ms | 9200ms | 15000ms | 0.5% | $3.4567 |
```

## Alert Thresholds

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Per-agent error rate | > 5% | Investigate agent reliability; consider model switch |
| Per-agent P95 latency | > 30,000ms | Check for stalls, timeouts; consider faster model tier |
| Overall error rate | > 10% | System-wide issue; escalate |
| Daily call volume drop | > 50% vs 7-day avg | Pipeline disruption |

**Alert query pattern:**
```
agent_metrics(operation: "dashboard") → check Err% > 5 and P95 > 30000
agent_metrics(operation: "trend") → detect day-over-day anomalies
```

## 30-Day Data Retention

The `agent_metrics` tool with `operation: "prune"` removes entries older than 30 days:

- **Cutoff calculation:** `new Date()` minus 30 calendar days
- **Non-destructive read:** `prune` returns pruned/remaining counts without mutating the file
- **Auto-prune schedule:** Recommended to run daily via cron or on agent startup
- **Expected file size:** ~1-5MB per 30 days at typical call volume

## Token Cost Correlation

Integration with `token-optimizer` MCP server for cost analysis:

1. **Collect:** `appendMetrics()` captures per-call token usage
2. **Aggregate:** `agent_metrics(operation: "dashboard")` computes cost at $30/M tokens
3. **Correlate:** Cross-reference agent-level token spend with `token-optimizer_analyze_project_tokens`
4. **Optimize:** Identify agents that could use lower-cost model tiers

**Cost model:** `(input_tokens + output_tokens) / 1_000_000 * $30`

## Trend Analysis

Use `agent_metrics(operation: "trend")` for daily roll-up:

```
| Day | Calls | Avg Lat | Err% |
|-----|-------|---------|------|
| 2025-06-09 | 45 | 3200ms | 2.2% |
| 2025-06-10 | 52 | 3100ms | 1.9% |
| 2025-06-11 | 48 | 3400ms | 4.2% |
```

## Query Filters

```
# Filter by agent name regex
agent_metrics(operation: "query", agentFilter: "reviewer")

# Filter by time range (timestamp ms)
agent_metrics(operation: "query", timeRange: { start: 1718000000000, end: 1718100000000 })

# Limit results
agent_metrics(operation: "query", limit: 25)
```

## Integration Points

| Integration | Purpose |
|-------------|---------|
| `token-optimizer` MCP | Cross-reference agent token spend with system-level costs |
| `observability-reviewer` agent | Weekly analysis, anomaly detection, model tier recommendations |
| Cron / scheduled tasks | Daily prune + trend compilation |
| Alerting (future) | Threshold-based alerts via webhook/email |
