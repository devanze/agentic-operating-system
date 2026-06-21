---
name: agent-fallback
description: Agent fallback and escalation chain patterns for automatic retry on subagent failure.
---

# Agent Fallback & Escalation

## Escalation Chains

When a subagent fails, escalate through the chain before halting:

### Compile/Test Failure Chain
tdd-guide → build-error-resolver → planner
- tdd-guide fails with compile/test error → retry with build-error-resolver
- build-error-resolver fails → escalate to planner for root-cause analysis
- Max depth: 3

### Build/Config Error Chain
build-error-resolver → planner → architect
- build-error-resolver fails → escalate to planner
- planner fails → escalate to architect for system-level analysis
- Max depth: 3

### Security Review Auto-Trigger
code-reviewer → security-reviewer (automatic)
- When code-reviewer detects: auth, secrets, API keys, input validation, crypto, permissions
- Auto-trigger security-reviewer without manual intervention
- This is NOT an escalation — it's an automatic next step

### Generic Fallback Chain
any-agent → general → planner → architect
- Any specialized agent fails → try general agent
- general fails → planner for approach review
- planner fails → architect for system redesign
- Max depth: 4

## Retry Rules

1. **Max attempts per task unit**: 3 total (including original call)
2. **Context preservation**: Pass original prompt + failure output + error details to each retry
3. **Failure classification**:
   - TRANSIENT (timeout, rate limit) → retry same agent once
   - STRUCTURAL (wrong agent, missing context) → escalate immediately
   - TERMINAL (auth failure, config error) → halt, notify user
4. **Escalation preserves original task scope** — don't expand or change the request
5. **Log every escalation** to agent-calls.jsonl with error_type

## Usage

Orchestrator should check subagent result for failure indicators:
- Exit code != 0
- Error message containing "blocked", "failed", "unable"
- Task result indicating incomplete work

Apply escalation chain based on failure type.

Use `/fallback` command to trigger manual escalation with preserved context.
