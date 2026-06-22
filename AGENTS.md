# OpenCode Agent System — Agent Instructions

Production-ready AI agent system for OpenCode with **64 specialized agents**, **43 skill packs**, **69 commands**, **8 custom tools**, **16 MCP servers**, and **instinct learning subsystem**.

**Version:** 1.1.0

---

## ⛔ Rule Priority Matrix

| Level | Tag | Meaning | Consequence if violated |
|-------|-----|---------|------------------------|
| **P0 — CRITICAL** | `🚫` | Must NEVER be violated. No exceptions. | Task HALTED. Fix before continuing. |
| **P1 — MANDATORY** | `⚠️` | Must always be followed. Only skip with explicit user override. | BLOCKED — cannot proceed to next phase. |
| **P2 — STANDARD** | `📌` | Best practice, expected in all code. | WARNING — flagged in review, must be addressed. |
| **P3 — GUIDELINE** | `💡` | Recommended, use judgment. | NOTE — reviewer may suggest but not block. |

**Enforcement gates:** Pre-task check → In-task monitoring → Post-task verification → Review gate.

---

## Agent Orchestration — PRIORITY P0/P1

### 🚫 P0: Orchestrator Agent is PURE ORCHESTRATOR

Orchestrator agent has `edit: deny, write: deny` permissions. It can **ONLY** use the Task tool for delegation. Even trivial tasks (typo, rename, single-line) **MUST** be delegated to a subagent.

**Building code directly = CRITICAL VIOLATION. Never happens. Zero tolerance.**

### 🚫 P0: Tool-to-Agent Permission Matrix (MANDATORY)

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

### ⚠️ P1: Delegation Pre-Check (MANDATORY — before EVERY task)

Before dispatching ANY task, verify ALL of:

1. **Correct subagent?** Match task to the right agent from the flow table below
2. **Clear prompt?** Subagent prompt has: exact task description, file paths, expected output format, stop condition
3. **No self-execution?** You are NOT doing the task yourself — verify delegation, not implementation
4. **Review planned?** A review step is scheduled after the subagent completes

### 🚫 P0: Self-Enforcement Pre-Flight Check (MANDATORY — before EVERY Write/Edit/Bash call)

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

### ⚠️ P1: Complexity-Gated Flow (MANDATORY)

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

### 🚫 P0: Parallel Delegation Rules

- Launch **independent** subagents in **parallel** — maximize throughput
- **NEVER** launch dependent agents in parallel — sequential only
- Maximum 5 parallel subagents at a time
- If an agent fails, re-dispatch with corrected prompt — do NOT attempt the work yourself

### ⚠️ P1: Agent Fallback & Escalation (MANDATORY)

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

### ⛔ Delegation Violation Path

```
Violation detected → HALT task → Log what was violated → Fix root cause → Re-dispatch correctly → Continue
```

### 🚫 P0: General Agent is LAST RESORT ONLY

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

---

## Development Workflow — PRIORITY P0/P1

### ⚠️ P1: MANDATORY Workflow Sequence

Every development task follows this **unskippable** sequence:

```
1. PLAN   → New project/empty folder: architect agent generates ARCHITECTURE.md + PROGRESS.md. Crash-prone or 3+ files: planner agent generates PLAN.md + PROGRESS.md. Feature architecture: code-architect generates BLUEPRINT.md + PROGRESS.md. Doc-updater then writes state tracking files (states.json, events.log, dependency-graph.json) into `status/` (greenfield) or `state/` (patch). Doc-updater MUST populate states.json with immutable `goal` block BEFORE orchestrator dispatches execution agent. **After dispatching doc-updater for state setup, WAIT for "State ready" confirmation before dispatching any execution agent.** The goal block is the intent anchor — it locks the destination while allowing flexible execution. For Level 5 tasks, tdd-guide scores all steps against the goal (0.0–1.0), reorders by priority, and auto-rewrites low-scoring steps before execution.
2. TDD    → tdd-guide agent: write tests FIRST, implement SECOND, refactor THIRD
3. REVIEW → code-reviewer agent immediately after code is written
4. SECURE → security-reviewer for auth/secrets/input/API changes (after code-reviewer)
5. DOCS   → doc-updater if docs changed (don't create new top-level files without asking)
6. COMMIT → Conventional commits format, comprehensive PR summaries
```

### ⚠️ P1: Layer Precedence (MANDATORY)

Execution agents MUST respect this layer hierarchy. Higher layers cannot be overridden by lower layers.

```
Layer 1 (P0): EXECUTION SAFETY    — dependency resolution, deterministic order
Layer 2 (P0): GOAL INTEGRITY       — pre-filter reject, per-step validator, drift limit
Layer 3 (P2): SCORING OPTIMIZATION — score valid steps, reorder within groups, auto-rewrite
```

| Rule | Precedence |
|------|-----------|
| Dependencies always beat scoring | Layer 1 > Layer 3 |
| Goal lock pre-filter runs before scoring | Layer 2 > Layer 3 |
| Scoring reorders WITHIN dependency groups only | Layer 3 constrained by Layer 1 |
| Auto-rewrite preserves step `produces` output | Layer 3 constrained by Layer 1 |
| Scoring disabled → goal lock still mandatory | Layer 2 independent of Layer 3 |

**Gate enforcement:**
- ❌ Phase 1 not complete? → BLOCK Phase 2
- ❌ Tests not passing 80%+ coverage? → BLOCK Phase 3
- ❌ Code review has CRITICAL issues? → BLOCK Phase 4+
- ❌ Security review has CRITICAL issues? → BLOCK Phase 5+

### ⚠️ P1: Review is MANDATORY (no exceptions)

```
AFTER ANY CODE CHANGE → code-reviewer
AFTER auth/secrets/input change → code-reviewer → security-reviewer
```

- Review happens **immediately** — not at the end of the day, not before commit, NOW
- CRITICAL and HIGH issues MUST be resolved before next phase
- Reviewer output is the final authority — don't argue, fix

### 📌 P2: Test-Driven Development (TDD)

1. **RED**: Write failing test first (tests MUST fail before implementation)
2. **GREEN**: Write minimal code to pass (don't over-engineer)
3. **REFACTOR**: Clean up while keeping tests green
4. **COVERAGE**: Verify 80%+ line and branch coverage

### 📌 P2: Commit & PR Rules

- Commit after each meaningful unit of work, not after the entire feature
- Format: `<type>: <description>` — feat, fix, refactor, docs, test, chore, perf, ci
- PR description must include: What, Why, How, Testing steps, Screenshots (if UI)
- Max 400 lines per PR — break large features into stacked PRs

---

## Core Principles

| # | Principle | Priority | Rule |
|---|-----------|----------|------|
| 1 | **Agent-First** | P0 🚫 | Delegate ALL work to specialized agents. Orchestrator agent NEVER executes code directly. |
| 2 | **Test-Driven** | P1 ⚠️ | Write tests before implementation, 80%+ coverage required. No exceptions. |
| 3 | **Security-First** | P0 🚫 | Never compromise on security. Validate all inputs. No hardcoded secrets. |
| 4 | **Immutability** | P1 ⚠️ | Always create new objects, never mutate existing ones. |
| 5 | **Plan Before Execute** | P1 ⚠️ | Plan complex features (3+ files) before writing any code. |
| 6 | **Minimal Change** | P2 📌 | Fix only what's broken; don't refactor unrelated code. |
| 7 | **Review Mandatory** | P0 🚫 | Every code change MUST be reviewed. Skip review = BLOCKED. |
| 8 | **Verify After Change** | P1 ⚠️ | Tests + typecheck + lint + security scan after every change batch. |

---

## Available Agents (64)

### Core Agents (v4-pro — Thinking Heavy)
| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, refactoring |
| architect | System design & scalability | Architectural decisions |
| code-architect | Feature architecture from codebase patterns | Feature design, blueprint |
| tdd-guide | Test-driven development | New features, bug fixes |
| code-reviewer | Code quality & maintainability | After writing/modifying code |
| security-reviewer | Vulnerability detection | Before commits, sensitive code |
| build-error-resolver | Fix build/type errors | When build fails |
| django-build-resolver | Fix Django migration/config errors | Django build failures |

### Execution Agents (v4-flash — Light & Fast)
| Agent | Purpose | When to Use |
|-------|---------|-------------|
| bash-specialist | Safe bash command execution | When orchestrator needs shell commands |
| e2e-runner | End-to-end testing | Critical user flows |
| refactor-cleaner | Dead code cleanup | Code maintenance |
| doc-updater | Documentation & codemaps | Updating docs |
| database-reviewer | DB schema & query review | Schema changes, queries |
| code-explorer | Codebase exploration | Understanding codebases |
| chief-of-staff | Communication triage & draft replies | Managing multi-channel messages |
| loop-operator | Autonomous loop control | Long-running agent tasks |

### Language Reviewers (v4-flash, read-only)
| Agent | Language/Framework |
|-------|-------------------|
| typescript-reviewer | TypeScript / JavaScript |
| python-reviewer | Python |
| go-reviewer | Go |
| rust-reviewer | Rust |
| kotlin-reviewer | Kotlin / Android / KMP |
| cpp-reviewer | C++ |
| csharp-reviewer | C# / .NET |
| dart-reviewer | Dart |
| flutter-reviewer | Flutter |
| react-reviewer | React |
| angular-reviewer | Angular |
| swift-reviewer | Swift / SwiftUI |
| php-reviewer | PHP / Laravel |
| ruby-reviewer | Ruby / Rails |
| perl-reviewer | Perl |

### Language Build Resolvers (v4-flash)
| Agent | Language |
|-------|----------|
| rust-build-resolver | Rust / Cargo |
| kotlin-build-resolver | Kotlin / Gradle |
| cpp-build-resolver | C++ / CMake |
| dart-build-resolver | Dart / Flutter |
| swift-build-resolver | Swift / Xcode |
| react-build-resolver | React / Next.js |
| php-build-resolver | PHP / Composer |
| go-build-resolver | Go build/vet errors |
| java-build-resolver | Java / Maven / Gradle |

### Framework Specialists (v4-flash, read-only)
| Agent | Framework |
|-------|-----------|
| django-reviewer | Django / DRF |
| fastapi-reviewer | FastAPI |
| springboot-reviewer | Spring Boot |
| java-reviewer | Java / JVM general |
| laravel-reviewer | Laravel |
| nestjs-reviewer | NestJS |
| nextjs-reviewer | Next.js |
| codeigniter-reviewer | CodeIgniter 4 |

### Role Specialists (v4-flash)
| Agent | Role |
|-------|------|
| uiux-designer | Design systems, usability, motion, Figma-to-code |
| ui-reviewer | Visual UI review with Playwright screenshots + vision AI | After UI changes, before merge |

### Specialist Agents (v4-flash)
| Agent | Purpose |
|-------|---------|
| performance-optimizer | Find & fix performance bottlenecks |
| harness-optimizer | Optimize agent config for reliability & cost |
| healthcare-reviewer | HIPAA, PHI, HL7/FHIR compliance |
| network-architect | Network topology & security design |
| mle-reviewer | Production ML pipelines & MLOps |
| silent-failure-hunter | Find bugs with no error messages |
| comment-analyzer | Review comment quality & usefulness |
| type-design-analyzer | Review type definitions & data models |
| conversation-analyzer | Analyze agent conversation patterns |
| pr-test-analyzer | Determine tests needed for PR |
| code-simplifier | Reduce complexity without changing behavior |
| docs-lookup | Fetch live library/API documentation via Context7 |
| seo-specialist | Technical SEO, structured data, CWV, keyword mapping |
| observability-reviewer | Agent metrics, latency trends, cost optimization |

## Custom Tools (8)

| Tool | Purpose |
|------|---------|
| run_tests | Run test suite with auto-detected framework |
| check_coverage | Analyze coverage against threshold |
| security_audit | Scan deps, secrets, and anti-patterns |
| format_code | Detect and run appropriate formatter |
| lint_check | Detect and run appropriate linter |
| git_summary | Show git branch, status, commits, diff |
| changed_files | List files changed in current session |
| agent_metrics | Query agent call metrics — dashboard, trends, cost analysis |

## MCP Servers (16)

Playwright (browser), Context7 (live docs), GitHub, Sequential Thinking, Memory (persistent), Exa (web search), Filesystem, Jira, Firecrawl, Supabase, Magic (design-to-code), Browserbase, Token Optimizer, CodeScene, Confluence, Fal.ai.

## Skills (43)

41 skill packs covering: coding standards, security, backend/frontend patterns, API/database/deployment design, error handling, testing, git, Docker, prompt engineering, language/framework patterns (Rust, Kotlin, C++, C#, SwiftUI, Flutter, React, Next.js, NestJS, Django, FastAPI, Spring Boot, Quarkus, Prisma, Redis, K8s), MCP servers, agent harness, autonomous loops, team orchestration, continuous learning, cost tracking, production audit, strategic compaction, search-first, verification loop, design system, accessibility, hexagonal architecture.

## Instinct Subsystem

Learns from every session — errors, fixes, patterns, and conventions recorded automatically.

| Command | Purpose |
|---------|---------|
| `/instinct-status` | View learned instincts, clusters, and history |
| `/instinct-export` | Export instincts to shareable file |
| `/instinct-import` | Import instincts from file or project |
| `/evolve` | Cluster similar instincts for skill creation |
| `/promote` | Promote instincts to global scope |
| `/projects` | List all projects and instinct stats |
| `/skill-evolve` | Create skill from instinct cluster |

Auto-capture: plugin hooks record bash errors and session summaries automatically.

## Workflow Surface Policy

- `skills/` is the canonical workflow surface.
- New workflow contributions should land in `skills/` first.
- `commands/` is a slash-entry compatibility surface for `/` command invocation and cross-harness parity.

## Security Guidelines

Before ANY commit:
- No hardcoded secrets (API keys, passwords, tokens)
- No secrets in environment variables exposed to client (NEXT_PUBLIC_*, REACT_APP_*, VITE_*)
- All user inputs validated at system boundaries
- SQL injection prevention: always parameterized queries, never string interpolation
- XSS prevention: sanitize all user-generated HTML, never trust raw input
- CSRF protection enabled on all state-changing endpoints
- Authentication and authorization verified on every protected route
- Rate limiting on all public endpoints
- Error messages must NOT leak sensitive data (stack traces, internal paths, PII)

**Secret management:** NEVER hardcode secrets. Use environment variables or a secret manager. Validate required secrets at startup. Rotate any exposed secrets immediately.

**If security issue found:** STOP → use `security-reviewer` agent → fix CRITICAL issues → rotate exposed secrets → review codebase for similar issues.

## Coding Style

**Immutability (CRITICAL):** Always create new objects, never mutate existing ones. Return new copies with changes applied.

**File organization:** Many small files over few large ones. 200-400 lines typical, 800 max. Organize by feature/domain, not by type. High cohesion, low coupling.

**Error handling:** Handle errors at every level. Provide user-friendly messages in UI code. Log detailed context server-side. Never silently swallow errors.

**Input validation:** Validate all user input at system boundaries. Use schema-based validation (zod, Pydantic, class-validator). Fail fast with clear messages. Never trust external data.

**Code quality:** Functions <50 lines, files <800 lines, no deep nesting (>4 levels), no hardcoded values, well-named identifiers.

## Testing Requirements

Minimum coverage: 80%.

Test types (all required):
1. **Unit tests** — Individual functions, utilities, components
2. **Integration tests** — API endpoints, database operations
3. **E2E tests** — Critical user flows

**TDD workflow (mandatory):**
1. Write test first (RED) — test should FAIL
2. Write minimal implementation (GREEN) — test should PASS
3. Refactor (IMPROVE) — verify coverage 80%+

Troubleshoot failures: check test isolation → verify mocks → fix implementation (not tests, unless tests are wrong).

## Architecture Patterns

**API response format:** Consistent envelope with success indicator, data payload, error message, and pagination metadata.

**Repository pattern:** Encapsulate data access behind standard interface (findAll, findById, create, update, delete). Business logic depends on abstract interface, not storage mechanism.

**Skeleton projects:** Search for battle-tested templates, evaluate with parallel agents (security, extensibility, relevance), clone best match, iterate within proven structure.

## Performance

**Context management:** Avoid last 20% of context window for large refactoring and multi-file features. Lower-sensitivity tasks (single edits, docs, simple fixes) tolerate higher utilization.

**Build troubleshooting:** Use build-error-resolver (or django-build-resolver for Django) → analyze errors → fix incrementally → verify after each fix.

## Git Workflow

Commit format: `<type>: <description>` — feat, fix, refactor, docs, test, chore, perf, ci

**PR workflow:** Analyze full commit history → draft comprehensive summary → include test plan → push with `-u` flag.

## Success Metrics

- All tests pass with 80%+ coverage
- No CRITICAL or HIGH security vulnerabilities
- Code follows project conventions and is readable
- Performance is within acceptable thresholds
- User requirements are met
- All non-trivial tasks planned before execution
