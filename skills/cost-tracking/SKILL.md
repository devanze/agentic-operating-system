---
name: cost-tracking
description: Cost tracking patterns for AI agent usage covering token counting, cost estimation, budget alerts, and optimization strategies. Use to manage AI operational costs.
---

# Cost Tracking

## Token Estimation
- Input tokens: roughly 4 chars = 1 token (English)
- Output tokens: similar ratio
- Track per-session and cumulative
- Estimate cost before large operations

## Cost Optimization

### Model Selection
- Heavy model (v4-pro) for: planning, architecture, security
- Light model (v4-flash) for: formatting, simple edits, exploration
- Right-size the model for the task

### Context Management
- Compact context before it gets expensive
- Summarize long tool outputs
- Reference files by path, not full content
- Prune irrelevant conversation history

### Agent Efficiency
- Delegate to specific, focused agents
- Clear prompts = fewer iterations
- One task per agent invocation
- Parallel agents reduce wall-clock time

## Monitoring
- Token usage per agent type
- Cost per feature/task
- Trends over time (increasing? decreasing?)
- Identify expensive patterns

## Budget Controls
- Set session token limits
- Alert at thresholds (50%, 80%, 95%)
- Pause on budget exhaustion
- Monthly/spending reports
