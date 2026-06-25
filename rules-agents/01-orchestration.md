# Agent Orchestration — PRIORITY P0/P1

## 🚫 P0: Orchestrator Agent is PURE ORCHESTRATOR

Orchestrator agent has `edit: deny, write: deny` permissions. It can **ONLY** use the Task tool for delegation. Even trivial tasks (typo, rename, single-line) **MUST** be delegated to a subagent.

**Building code directly = CRITICAL VIOLATION. Never happens. Zero tolerance.**

## 🚫 P0: Tool-to-Agent Permission Matrix (MANDATORY)

Every agent type has a strict tool allowance. Using a tool not listed for your agent type is a CRITICAL VIOLATION.

| Agent Type | Tools Allowed |
|---|---|
| **Orchestrator Agent** | `Task` ONLY — delegation is the sole mechanism |
| **tdd-guide** | `Bash`, `Write`, `Edit`, `Read`, `Glob`, `Grep`, `Task` |
| **code-reviewer** | `Read`, `Glob`, `Grep` ONLY (read-only) |
| **security-reviewer** | `Read`, `Glob`, `Grep` ONLY (read-only) |
| **planner** | `Read`, `Write`, `Bash`, `Task` (plan documents only — PLAN.md, PROGRESS.md) |
| **architect** | `Read`, `Write`, `Bash`, `Task` (plan documents only — ARCHITECTURE.md, PROGRESS.md) |
| **code-architect** | `Read`, `Write`, `Task` (plan documents only — BLUEPRINT.md, PROGRESS.md) |
| **uiux-designer** | `Read`, `Write`, `Edit`, `Glob`, `Grep`, `Task`, `Skill` |
| **ui-reviewer** | `Read`, `Write`, `Glob`, `Grep` (Playwright MCP tools for browser capture) |
| **doc-updater** | `Read`, `Write`, `Edit`, `Glob`, `Grep`, `filesystem_move_file` |
| **refactor-cleaner** | `Bash`, `Write`, `Edit`, `Read`, `Glob`, `Grep` |
| **bash-specialist** | `Bash`, `Read`, `Write` (bash execution only, no code editing) |
| **build-error-resolver / django-build-resolver** | `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep` |
| **code-explorer / explore** | `Read`, `Glob`, `Grep` ONLY (read-only) |
| **database-reviewer** | `Read`, `Glob`, `Grep` ONLY (read-only) |
| **e2e-runner** | `Bash`, `Read`, `Glob`, `Grep`, `Write`, `Edit` |
| **performance-optimizer** | `Bash`, `Read`, `Glob`, `Grep`, `Write`, `Edit` |
| **All language reviewers** (python-reviewer, go-reviewer, etc.) | `Read`, `Glob`, `Grep` ONLY (read-only) |
| **All build resolvers** (rust-build-resolver, etc.) | `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep` |
| **general** | `Bash`, `Write`, `Edit`, `Read`, `Glob`, `Grep`, `Task` |

**Orchestrator Agent self-check:** If you are the Orchestrator Agent and you are about to call `Write`, `Edit`, or `Bash` — STOP. This is a CRITICAL VIOLATION. Re-dispatch to the correct subagent instead.

## ⚠️ P1: Delegation Pre-Check (MANDATORY — before EVERY task)

Before dispatching ANY task, verify ALL of:

1. **Correct subagent?** Match task to the right agent from the flow table below
2. **Clear prompt?** Subagent prompt has: exact task description, file paths, expected output format, stop condition
3. **No self-execution?** You are NOT doing the task yourself — verify delegation, not implementation
4. **Review planned?** A review step is scheduled after the subagent completes

## 🚫 P0: Self-Enforcement Pre-Flight Check (MANDATORY — before EVERY Write/Edit/Bash call)

Before issuing ANY `Write`, `Edit`, or `Bash` tool call, every agent MUST perform this self-check:

```
┌─────────────────────────────────────────┐
│ PRE-FLIGHT: Am I the Orchestrator Agent?       │
│                                          │
│ YES → BLOCKED. Delegate to subagent.    │
│ NO  → Am I authorized for this tool?    │
│       Check Tool-to-Agent Matrix above. │
│       YES → Proceed.                    │
│       NO  → BLOCKED. Re-dispatch.       │
└─────────────────────────────────────────┘
```

**Common violation pattern:** Orchestrator Agent sees a simple edit and thinks "this is trivial, I'll just do it." THIS IS STILL A VIOLATION. Triviality does not grant permission. Only agent type grants permission.

## ⚠️ P1: Complexity-Gated Flow (MANDATORY)

| Task Complexity | Flow | Pre-check |
|---|---|---|
| **Trivial** (typo, rename, single-line) | tdd-guide → code-reviewer | Verify it's truly trivial first |
| **Small** (1 file, clear scope) | tdd-guide → code-reviewer | Confirm scope boundary |
| **Medium+** (3+ files, new feature, refactor) | planner → specialist-executor → code-reviewer | Planner output approved before code; pick correct specialist |
| **Greenfield** (new project, empty folder) | architect → specialist-executor → code-reviewer | Architect designs, then dispatch correct specialist |
| **UI/UX** (design, Figma-to-code) | planner → uiux-designer → code-reviewer | Design review before/alongside code |
| **UI Review** (visual check, screenshot analysis) | ... → ui-reviewer → code-reviewer | UI review after implementation, before merge |
| **Security** (auth, API keys, input handling) | ... → security-reviewer (mandatory) | Security reviewer runs AFTER code reviewer |
| **Architecture** | code-architect or architect | Architecture doc approved before any code |
| **DB schema/query** | database-reviewer | Schema review BEFORE migration; then tdd-guide for code |
| **Build/compile error** | build-error-resolver or django-build-resolver | Fix incrementally, verify after each fix |
| **Performance** | performance-optimizer | Baseline metrics before optimization |
| **Explore codebase** | code-explorer | Define what to explore before launching |
| **Docs** | doc-updater | Only update docs; don't create new top-level files |
| **Cleanup** | refactor-cleaner | Verify no behavior change via tests after cleanup |
| **E2E test** | e2e-runner | Define critical flows before generating tests |
| **SEO** | seo-specialist | Audit first, optimize second |
| **No specialist match** | general → code-reviewer | ⚠️ general is LAST RESORT — log why no specialist exists |

## 🚫 P0: Parallel Delegation Rules

- Launch **independent** subagents in **parallel** — maximize throughput
- **NEVER** launch dependent agents in parallel — sequential only
- Maximum 5 parallel subagents at a time
- If an agent fails, re-dispatch with corrected prompt — do NOT attempt the work yourself

## ⚠️ P1: Agent Fallback & Escalation (MANDATORY)

When a subagent fails, apply escalation chains before halting:

| Failure Type | Escalation Chain | Max Depth |
|-------------|------------------|-----------|
| Compile/Test failure from tdd-guide | tdd-guide → build-error-resolver → planner | 3 |
| Build/config error | build-error-resolver → planner → architect | 3 |
| Sensitive code detected | code-reviewer → security-reviewer (auto) | 2 |
| Generic agent failure | any-agent → general → planner → architect | 4 |

**Escalation rules:**
- Preserve original task context across all retries
- Max 3 total attempts per task unit (including original)
- Classify failures: TRANSIENT (retry same agent once) / STRUCTURAL (escalate) / TERMINAL (halt, notify)
- Log all escalations to agent-calls.jsonl
- After max depth exhausted: HALT, notify user, use `/fallback` for manual escalation

**Trivial task boundary — STRICT definition:**

| Is this trivial? | Example | Delegation required? |
|---|---|---|
| ✅ Yes | Fix a typo in a comment (1 word): `fucntion` → `function` | YES — to `tdd-guide` |
| ✅ Yes | Rename a variable across 1 file | YES — to `tdd-guide` |
| ❌ NOT trivial | Any logic change (even 1 line) | YES — to `tdd-guide` |
| ❌ NOT trivial | Adding/removing a parameter | YES — to `tdd-guide` |
| ❌ NOT trivial | Any config or rule file change | YES — to `doc-updater` |

**Key principle:** "Trivial" describes task SIZE, not permission to self-execute. Even a 1-character typo fix MUST be delegated. Triviality only affects WHICH subagent to use (skip planner, go directly to tdd-guide).

## ⛔ Delegation Violation Path

```
Violation detected → HALT task → Log what was violated → Fix root cause → Re-dispatch correctly → Continue
```

## 🚫 P0: General Agent is LAST RESORT ONLY

The `general` agent is a built-in framework agent with write capabilities. It MUST NOT be used casually.

**When to use general:**
- No specialist agent exists for the task domain
- All specialist agents in the escalation chain have failed

**When NOT to use general:**
- As a shortcut instead of finding the right specialist
- Because "it's faster" or "it's simpler"
- For any task that has a dedicated specialist agent

**Before dispatching to general:**
1. Verify no specialist agent matches the task
2. Log the reason explicitly in the dispatch prompt
3. Always follow general with code-reviewer

**Escalation chain only:**
- `any-agent → general → planner → architect` is for FAILURES only, not for initial dispatch
- Never dispatch to general as the first agent for a new task
