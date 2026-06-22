# OpenCode Agent System

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/devanze/agentic-operating-system)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Agents](https://img.shields.io/badge/agents-64-ff6b6b.svg)](#agent-ecosystem)
[![Skills](https://img.shields.io/badge/skills-44-845ef7.svg)](#skill-packs)
[![Commands](https://img.shields.io/badge/commands-69-ffd43b.svg)](#commands)
[![Tools](https://img.shields.io/badge/tools-8-20c997.svg)](#custom-tools)
[![MCP Servers](https://img.shields.io/badge/MCP-16-339af0.svg)](#mcp-servers)
[![Node](https://img.shields.io/badge/node-%3E%3D18.x-5fa04e.svg)](package.json)
[![TypeScript](https://img.shields.io/badge/typescript-6.x-3178c6.svg)](package.json)
[![Vitest](https://img.shields.io/badge/vitest-4.x-6b9e3f.svg)](package.json)

**Production-ready custom AI agent system for OpenCode** — 64 specialized agents, 44 skill packs, 69 slash commands, 8 custom tools, 16 MCP servers, and an instinct learning subsystem. The system supercharges OpenCode with a disciplined team of specialized AI agents that plan, build, review, secure, and maintain your code.

---

## Overview

OpenCode Agent System transforms OpenCode from a single-AI coding assistant into a **team of specialized AI agents** governed by strict orchestration rules, priority enforcement, and automated quality gates. Instead of one AI doing everything, a pure orchestrator delegates work to the right specialist: planners for architecture, tdd-guide for test-driven development, code-reviewer for quality, security-reviewer for vulnerability detection, and 58 more.

The system uses a **dual-model routing** strategy — DeepSeek V4 Pro for heavy thinking (planning, architecture, review) and DeepSeek V4 Flash for light execution (formatting, exploration, simple edits) — balancing quality with cost efficiency across 6 SumoPod models.

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Orchestrator Agent                     │
│               (PURE ORCHESTRATOR — read-only)             │
│            Delegates ALL work — never executes code       │
└──────────────┬──────────────┬────────────────┬────────────┘
               │              │                │
     ┌─────────▼──┐   ┌──────▼──────┐  ┌─────▼──────────┐
     │   Planner   │   │  Architect  │  │  Code Architect │
     │  (v4-pro)   │   │  (v4-pro)   │  │    (v4-pro)     │
     └──────┬──────┘   └──────┬──────┘  └───────┬─────────┘
            └─────────────────┼──────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │    tdd-guide      │
                    │  (v4-pro)         │
                    │  TDD + Implement  │
                    └─────────┬─────────┘
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
        ┌──────────┐  ┌──────────────┐  ┌────────────┐
        │ Code     │  │  Security    │  │  Doc       │
        │ Reviewer │  │  Reviewer    │  │  Updater   │
        │(read-only)│  │ (read-only)  │  │            │
        └──────────┘  └──────────────┘  └────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  80+ Specialists  │
                    │  15 Languages     │
                    │  8 Frameworks     │
                    │  14 Domains       │
                    └───────────────────┘
```

---

## Features

### Orchestration & Control

- **Pure Orchestration Model** — The Orchestrator Agent has `edit: deny, write: deny` permissions. It uses the Task tool exclusively. Direct code execution is a critical violation. Zero tolerance.
- **Complexity-Gated Workflow** — Task complexity determines the agent pipeline. Trivial tasks go directly to tdd-guide; medium+ tasks pass through planner → specialist → reviewer; greenfield projects go architect → specialist → reviewer.
- **Priority Rule Matrix (P0–P3)** — Four-tier enforcement with automatic gates. P0 critical rules halt execution on violation. P1 mandatory rules block phase transitions. P2/P3 standard practices with warnings.
- **Escalation & Fallback Chains** — Automatic retry and escalation on subagent failure (transient → retry, structural → escalate, terminal → halt). Max 3 attempts per task unit with full context preservation.
- **Goal Lock System** — Immutable intent anchor written once at task creation. Every step validated against success criteria. Drift detection halts execution after 3 warnings.

### Development Workflow

- **TDD-First Mandatory** — RED (write failing test) → GREEN (minimal implementation) → REFACTOR (clean while green). 80%+ coverage required. No exceptions.
- **Review Gates** — Code review is mandatory after every change. Security review is automatic for auth/secrets/input changes. CRITICAL and HIGH issues must resolve before next phase.
- **Verification Loop** — Tests + typecheck + lint + format + security scan after every change batch. All checks must pass to proceed.
- **State-Aware Execution** — Executors read/write to a canonical `states.json` with immutable `goal` block, structured `steps`, scoring, drift tracking, and events log.

### Intelligence & Learning

- **Instinct Learning Subsystem** — SQLite-backed knowledge graph that learns from every session. Extracts patterns, captures errors, clusters learnings, and evolves skills automatically.
- **Semantic Goal Scoring (Lv 5 Runtime)** — Every step is scored (0.0–1.0) against success criteria. Low-scoring steps are auto-rewritten. Highest-impact steps execute first. Steps contradicting non-goals are rejected.
- **Strategic Context Compaction** — Preserves task state, decisions, and progress while discarding verbose tool outputs. Prevents context window bloat during long sessions.

### Observability

- **Metrics Pipeline** — Every agent call recorded to `agent-calls.jsonl` with latency, token usage, error type, and tool used.
- **Dashboard Aggregation** — P50/P95/P99 latency, error rates, token costs per agent. 30-day data retention with auto-prune.
- **Alert Thresholds** — Error rate > 5%, P95 latency > 30s trigger investigation.
- **Token Cost Correlation** — Cross-reference agent-level spend with model tier optimization.

---

## Installation

### Prerequisites

- **Node.js** >= 18.x
- **OpenCode** installed and configured
- **Git** (for version control integration)

### Quick Install

```bash
# Clone the repository
git clone https://github.com/devanze/agentic-operating-system.git
cd agentic-operating-system

# Install into your project's .opencode/ directory
./install.sh /path/to/your/project
```

The installer copies all agents, skills, commands, plugins, tools, rules, scripts, and configuration files into `<project>/.opencode/`. Your project is immediately ready with all 64 agents, 43 skill packs, and full orchestration.

### Manual Setup

```bash
# Create the .opencode directory
mkdir -p /path/to/your/project/.opencode

# Copy the agent system
cp -r agents skills commands plugins tools rules scripts instructions \
  opencode.json AGENTS.md /path/to/your/project/.opencode/

# Install dependencies
cd /path/to/your/project/.opencode
npm install
```

### Verifying Installation

```bash
# Run the health check
node scripts/check/doctor.js

# Validate agent configurations
node scripts/validate/agents.js

# Validate skill packs
node scripts/validate/skills.js
```

---

## Quick Start

### 1. Open a Project

Launch OpenCode in a project that has `.opencode/` installed:

```bash
opencode /path/to/your/project
```

### 2. Use Slash Commands

The system provides 69 slash commands. Here are the most common:

| Command | Purpose |
|---------|---------|
| `/plan` | Create implementation plan (complex features) |
| `/td` | Start test-driven development |
| `/review` | Run code review on current changes |
| `/security` | Run security audit |
| `/build` | Fix build/compile errors |
| `/explore` | Explore and map codebase structure |
| `/docs` | Update documentation from code |
| `/refactor` | Clean up dead code |
| `/e2e` | Run end-to-end tests |
| `/perf` | Analyze performance bottlenecks |
| `/coverage` | Check test coverage |
| `/quality` | Run quality gate checks |
| `/orchestrate` | Multi-agent orchestration |

### 3. Full Workflow Example

```bash
# 1. Plan a new feature
/plan "Add user authentication with JWT"

# 2. The orchestrator dispatches:
#    planner → ARCHITECTURE.md → code-architect → BLUEPRINT.md
#    → tdd-guide (write tests) → tdd-guide (implement)
#    → code-reviewer → security-reviewer → doc-updater

# 3. Review results
/review

# 4. Check quality
/quality

# 5. Check coverage
/coverage
```

---

## Agent Ecosystem

The system includes **64 specialized agents** across 9 categories, routed by task complexity and domain.

### Core Agents (v4-pro — Thinking Heavy)

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **planner** | Implementation planning | Complex features, refactoring |
| **architect** | System design & scalability | Architectural decisions |
| **code-architect** | Feature architecture from codebase patterns | Feature design, blueprint |
| **tdd-guide** | Test-driven development | New features, bug fixes |
| **code-reviewer** | Code quality & maintainability | After writing/modifying code |
| **security-reviewer** | Vulnerability detection | Before commits, sensitive code |
| **build-error-resolver** | Fix build/type errors | When build fails |
| **django-build-resolver** | Fix Django migration/config errors | Django build failures |

### Execution Agents (v4-flash — Light & Fast)

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **bash-specialist** | Safe bash command execution | When orchestrator needs shell commands |
| **e2e-runner** | End-to-end testing | Critical user flows |
| **refactor-cleaner** | Dead code cleanup | Code maintenance |
| **doc-updater** | Documentation & codemaps | Updating docs |
| **database-reviewer** | DB schema & query review | Schema changes, queries |
| **code-explorer** | Codebase exploration | Understanding codebases |
| **chief-of-staff** | Communication triage & draft replies | Managing multi-channel messages |
| **loop-operator** | Autonomous loop control | Long-running agent tasks |

### Language Reviewers (v4-flash, read-only)

| Agent | Language/Framework |
|-------|-------------------|
| **typescript-reviewer** | TypeScript / JavaScript |
| **python-reviewer** | Python |
| **go-reviewer** | Go |
| **rust-reviewer** | Rust |
| **kotlin-reviewer** | Kotlin / Android / KMP |
| **cpp-reviewer** | C++ |
| **csharp-reviewer** | C# / .NET |
| **dart-reviewer** | Dart |
| **flutter-reviewer** | Flutter |
| **react-reviewer** | React |
| **angular-reviewer** | Angular |
| **swift-reviewer** | Swift / SwiftUI |
| **php-reviewer** | PHP / Laravel |
| **ruby-reviewer** | Ruby / Rails |
| **perl-reviewer** | Perl |

### Language Build Resolvers (v4-flash)

| Agent | Language |
|-------|----------|
| **rust-build-resolver** | Rust / Cargo |
| **kotlin-build-resolver** | Kotlin / Gradle |
| **cpp-build-resolver** | C++ / CMake |
| **dart-build-resolver** | Dart / Flutter |
| **swift-build-resolver** | Swift / Xcode |
| **react-build-resolver** | React / Next.js |
| **php-build-resolver** | PHP / Composer |
| **go-build-resolver** | Go build/vet errors |
| **java-build-resolver** | Java / Maven / Gradle |

### Framework Specialists (v4-flash, read-only)

| Agent | Framework |
|-------|-----------|
| **django-reviewer** | Django / DRF |
| **fastapi-reviewer** | FastAPI |
| **springboot-reviewer** | Spring Boot |
| **java-reviewer** | Java / JVM general |
| **laravel-reviewer** | Laravel |
| **nestjs-reviewer** | NestJS |
| **nextjs-reviewer** | Next.js |
| **codeigniter-reviewer** | CodeIgniter 4 |

### Role Specialists (v4-flash)

| Agent | Role | When |
|-------|------|------|
| **uiux-designer** | Design systems, usability, Figma-to-code | UI/UX design phase |
| **ui-reviewer** | Visual UI review with Playwright + vision AI | After UI changes, before merge |

### Specialist Agents (v4-flash)

| Agent | Purpose |
|-------|---------|
| **performance-optimizer** | Find & fix performance bottlenecks |
| **harness-optimizer** | Optimize agent config for reliability & cost |
| **healthcare-reviewer** | HIPAA, PHI, HL7/FHIR compliance |
| **network-architect** | Network topology & security design |
| **mle-reviewer** | Production ML pipelines & MLOps |
| **silent-failure-hunter** | Find bugs with no error messages |
| **comment-analyzer** | Review comment quality & usefulness |
| **type-design-analyzer** | Review type definitions & data models |
| **conversation-analyzer** | Analyze agent conversation patterns |
| **pr-test-analyzer** | Determine tests needed for PR |
| **code-simplifier** | Reduce complexity without changing behavior |
| **docs-lookup** | Fetch live library/API documentation via Context7 |
| **seo-specialist** | Technical SEO, structured data, CWV, keyword mapping |
| **observability-reviewer** | Agent metrics, latency trends, cost analysis |

### Tool Permissions Matrix

Every agent type has a strict tool allowance. Using a tool not listed for your agent type is a critical violation.

| Agent Type | Tools Allowed |
|------------|---------------|
| Orchestrator | `Task` ONLY |
| tdd-guide | `Bash`, `Write`, `Edit`, `Read`, `Glob`, `Grep`, `Task` |
| code-reviewer | `Read`, `Glob`, `Grep` ONLY |
| security-reviewer | `Read`, `Glob`, `Grep` ONLY |
| planner, architect | `Read`, `Write`, `Bash`, `Task` (plan docs only) |
| code-architect | `Read`, `Write`, `Task` (plan docs only) |
| uiux-designer | `Read`, `Write`, `Edit`, `Glob`, `Grep`, `Task`, `Skill` |
| doc-updater | `Read`, `Write`, `Edit`, `Glob`, `Grep`, `filesystem_move_file` |
| refactor-cleaner | `Bash`, `Write`, `Edit`, `Read`, `Glob`, `Grep` |
| bash-specialist | `Bash`, `Read`, `Write` |
| e2e-runner | `Bash`, `Read`, `Glob`, `Grep`, `Write`, `Edit` |
| Language reviewers | `Read`, `Glob`, `Grep` ONLY |
| Build resolvers | `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep` |
| general | `Bash`, `Write`, `Edit`, `Read`, `Glob`, `Grep`, `Task` |

---

## Complexity-Gated Workflow

Task complexity determines which agents handle the work:

| Task Complexity | Flow | Pre-check |
|-----------------|------|-----------|
| **Trivial** (typo, rename, single-line) | tdd-guide → code-reviewer | Verify it's truly trivial first |
| **Small** (1 file, clear scope) | tdd-guide → code-reviewer | Confirm scope boundary |
| **Medium+** (3+ files, new feature, refactor) | planner → specialist-executor → code-reviewer | Planner output approved before code |
| **Greenfield** (new project) | architect → specialist-executor → code-reviewer | Architect designs, then dispatch |
| **UI/UX** (design, Figma-to-code) | planner → uiux-designer → code-reviewer | Design review before/alongside code |
| **Security** (auth, API keys, input handling) | ... → security-reviewer (mandatory) | After code-reviewer |
| **Build/compile error** | build-error-resolver or django-build-resolver | Fix incrementally, verify after each fix |
| **Performance** | performance-optimizer | Baseline metrics before optimization |
| **Docs** | doc-updater | Only update docs |
| **Cleanup** | refactor-cleaner | Verify no behavior change via tests |

### Escalation Chains

When a subagent fails, the system escalates automatically:

| Failure Type | Escalation Chain | Max Depth |
|-------------|------------------|-----------|
| Compile/Test failure | tdd-guide → build-error-resolver → planner | 3 |
| Build/config error | build-error-resolver → planner → architect | 3 |
| Generic agent failure | any-agent → general → planner → architect | 4 |

---

## Priority Rule Matrix

The system enforces a four-tier priority system with automatic gates:

| Level | Tag | Meaning | Consequence |
|-------|-----|---------|-------------|
| **P0 — Critical** | 🚫 | Must never be violated. No exceptions. | Task halted. Fix before continuing. |
| **P1 — Mandatory** | ⚠️ | Must always be followed. | Blocked — cannot proceed to next phase. |
| **P2 — Standard** | 📌 | Best practice, expected in all code. | Warning — flagged in review. |
| **P3 — Guideline** | 💡 | Recommended, use judgment. | Note — reviewer may suggest. |

**Enforcement gates:** Pre-task check → In-task monitoring → Post-task verification → Review gate.

### Layer Precedence

Execution respects a strict layer hierarchy:

```
Layer 1 (P0): EXECUTION SAFETY    — dependency resolution, deterministic order
Layer 2 (P0): GOAL INTEGRITY       — pre-filter reject, per-step validator, drift limit
Layer 3 (P2): SCORING OPTIMIZATION — score valid steps, reorder within groups, auto-rewrite
```

Dependencies always beat scoring. Goal lock pre-filter runs before scoring. Scoring reorders within dependency groups only.

---

## Skill Packs

The system ships **43 skill packs** that provide specialized instructions and workflows. Skills are loaded on demand when a task matches their description.

### Coding Standards & Patterns

| Skill | Description |
|-------|-------------|
| **coding-standards** | Universal coding standards — immutability, file organization, naming |
| **security-patterns** | Secret management, input validation, injection prevention |
| **backend-patterns** | Layered architecture, repository pattern, API design |
| **frontend-patterns** | React component design, state management, performance |
| **api-design** | REST, GraphQL, versioning, pagination, error handling |
| **database-patterns** | Schema design, indexing, migrations, query optimization |
| **deployment-patterns** | CI/CD, Docker, zero-downtime, rollback strategies |
| **error-handling** | Error types, recovery strategies, user-friendly messages |
| **testing-patterns** | Unit/integration/E2E, mocking, coverage targets |
| **git-workflow** | Branching, commit conventions, PR best practices |
| **docker-patterns** | Dockerfiles, multi-stage builds, image optimization |

### Language-Specific Skills

| Skill | Language/Framework |
|-------|-------------------|
| **rust-patterns** | Rust ownership, traits, async, error handling |
| **kotlin-patterns** | Kotlin scope functions, coroutines, flows |
| **cpp-coding-standards** | C++ RAII, smart pointers, const correctness |
| **csharp-testing** | C# xUnit, Moq, FluentAssertions |
| **swiftui-patterns** | SwiftUI View composition, state management |
| **dart-flutter-patterns** | Dart null safety, widget composition, Riverpod |

### Framework-Specific Skills

| Skill | Framework |
|-------|-----------|
| **react-performance** | React memoization, code splitting, virtualization |
| **nextjs-turbopack** | Next.js App Router, Server Components, streaming |
| **nestjs-patterns** | NestJS modules, decorators, DI, guards |
| **django-patterns** | Django models, querysets, class-based views |
| **fastapi-patterns** | FastAPI Pydantic models, DI, background tasks |
| **springboot-patterns** | Spring Boot JPA, REST, security, testing |
| **quarkus-patterns** | Quarkus reactive, Panache, native compilation |

### Infrastructure & Tools

| Skill | Description |
|-------|-------------|
| **prisma-patterns** | Prisma schema design, migrations, query optimization |
| **redis-patterns** | Caching, sessions, rate limiting, pub/sub |
| **kubernetes-patterns** | Deployments, services, ConfigMaps, health checks |
| **mcp-server-patterns** | MCP tool design, resource exposure, transports |
| **design-system** | Design tokens, component architecture, theming |
| **ui-ux-pro-max** | 67 styles, 161 palettes, 57 fonts, 99 UX rules, 17 stacks, design system generator |
| **accessibility** | WCAG compliance, semantic HTML, ARIA, keyboard nav |
| **hexagonal-architecture** | Ports & adapters, domain isolation, testing |

### Agent & System Skills

| Skill | Description |
|-------|-------------|
| **agent-harness-construction** | Agent definition, tool binding, model routing |
| **autonomous-loops** | Goal definition, checkpointing, stall detection |
| **team-agent-orchestration** | Parallel execution, coordination, result merging |
| **continuous-learning** | Pattern extraction, knowledge distillation |
| **cost-tracking** | Token counting, cost estimation, budget controls |
| **production-audit** | Error handling, logging, security, disaster recovery |
| **strategic-compact** | Context compaction, preservation, state recovery |
| **search-first** | Search codebase/docs before writing new code |
| **verification-loop** | Tests + lint + typecheck + security after changes |
| **observability-pipeline** | Metric collection, dashboard, alert thresholds |
| **agent-fallback** | Escalation chains, retry rules |

---

## Commands

The system provides **69 slash commands** organized by category.

### Development

| Command | Description |
|---------|-------------|
| `/td` | Start test-driven development workflow |
| `/plan` | Create detailed implementation plan |
| `/build` | Fix build and compilation errors |
| `/e2e` | Run end-to-end tests |
| `/perf` | Find and fix performance bottlenecks |
| `/refactor` | Clean up dead code and improve structure |
| `/coverage` | Check and analyze test coverage |

### Review & Quality

| Command | Description |
|---------|-------------|
| `/review` | Run comprehensive code review |
| `/security` | Run security vulnerability audit |
| `/quality` | Run quality gate checks |
| `/db-review` | Review database schema and queries |
| `/ts-review` | TypeScript-specific code review |
| `/py-review` | Python-specific code review |
| `/rust-review` | Rust-specific code review |
| `/go-review` | Go-specific code review |
| `/kotlin-review` | Kotlin-specific code review |
| `/cpp-review` | C++-specific code review |
| `/csharp-review` | C#-specific code review |
| `/swift-review` | Swift/SwiftUI-specific code review |
| `/flutter-review` | Flutter-specific code review |
| `/spring-review` | Spring Boot-specific code review |
| `/fastapi-review` | FastAPI-specific code review |
| `/django-review` | Django-specific code review |
| `/nestjs-review` | NestJS-specific code review |
| `/nextjs-review` | Next.js-specific code review |
| `/react-review` | React-specific code review |
| `/angular-review` | Angular-specific code review |
| `/laravel-review` | Laravel-specific code review |
| `/php-review` | PHP-specific code review |
| `/ruby-review` | Ruby/Rails-specific code review |
| `/perl-review` | Perl-specific code review |
| `/codeigniter-review` | CodeIgniter 4-specific code review |

### Build & Deploy

| Command | Description |
|---------|-------------|
| `/rust-build` | Fix Rust/Cargo build errors |
| `/go-build` | Fix Go build/vet errors |
| `/kotlin-build` | Fix Kotlin/Gradle build errors |
| `/cpp-build` | Fix C++/CMake build errors |
| `/django-build` | Fix Django migration/config errors |

### Intelligence & Learning

| Command | Description |
|---------|-------------|
| `/instinct-status` | View learned instincts, clusters, and history |
| `/instinct-export` | Export instincts to shareable file |
| `/instinct-import` | Import instincts from file or project |
| `/evolve` | Cluster similar instincts for skill creation |
| `/promote` | Promote instincts to global scope |
| `/projects` | List all projects and instinct stats |
| `/skill-evolve` | Create skill from instinct cluster |
| `/learn` | Extract patterns from the current session |

### Utility

| Command | Description |
|---------|-------------|
| `/explore` | Explore and map codebase structure |
| `/docs` | Update documentation and codemaps |
| `/docs-lookup` | Fetch live library/API docs via Context7 |
| `/web-search` | Search the web for solutions |
| `/seo` | Run technical SEO audit |
| `/ux` | UI/UX review and design |
| `/harness` | Optimize agent harness configuration |
| `/multi` | Multi-agent orchestration |
| `/orchestrate` | Coordinate multiple agents on a task |
| `/loop` | Start autonomous agent loop |
| `/checkpoint` | Save current session checkpoint |
| `/save` | Save current state |
| `/resume` | Resume from last checkpoint |
| `/setup` | Initialize project configuration |
| `/project-init` | Initialize new project with scaffolding |
| `/git-status` | Show git status and summary |
| `/convention` | Show project conventions |
| `/hookify` | Apply lifecycle hooks to project |
| `/prune` | Prune old metrics and logs |
| `/sessions` | List and manage sessions |
| `/verify` | Run verification loop |
| `/update-codemaps` | Regenerate codebase codemaps |
| `/fallback` | Trigger manual escalation with context |
| `/architect` | Start architecture design session |
| `/code-architect` | Start feature blueprint session |

---

## Custom Tools

The system provides **8 custom tools** accessible to agents:

| Tool | Purpose | Capabilities |
|------|---------|-------------|
| **run_tests** | Run test suite with auto-detected framework | Coverage, watch mode, pattern filtering |
| **check_coverage** | Analyze coverage against threshold | Reads reports from common locations |
| **security_audit** | Comprehensive security scanning | Deps, secrets, anti-pattern detection |
| **format_code** | Auto-format code | Detects and runs appropriate formatter |
| **lint_check** | Lint code with auto-fix | ESLint, Biome, Ruff, golangci-lint, Clippy |
| **git_summary** | Git repository status | Branch, working tree, commits, diff |
| **changed_files** | List files changed in session | Navigable tree with change indicators |
| **agent_metrics** | Query agent call metrics | Latency, token cost, error rates |

---

## MCP Servers

The system integrates **16 MCP (Model Context Protocol) servers** providing external capabilities to agents:

| Server | Purpose |
|--------|---------|
| **Playwright** | Browser automation, page interaction, screenshots |
| **Context7** | Live library documentation fetching |
| **GitHub** | Repository management, PRs, issues |
| **Sequential Thinking** | Multi-step reasoning and problem solving |
| **Memory** | Persistent knowledge graph across sessions |
| **Exa** | Web search and information retrieval |
| **Filesystem** | File and directory operations |
| **Jira** | Issue tracking and project management |
| **Firecrawl** | Web scraping and content extraction |
| **Supabase** | Database and authentication |
| **Magic** | Design-to-code conversion (Magic UI) |
| **Browserbase** | Cloud browser automation |
| **Token Optimizer** | Token usage optimization and cost analysis |
| **CodeScene** | Code quality and complexity analysis |
| **Confluence** | Documentation and knowledge base |
| **Fal.ai** | AI media generation (images, video, audio) |

---

## Provider Models

The system supports **6 SumoPod models** with dual-model routing:

### SumoPod AI
| Model | Name | Tier |
|-------|------|------|
| `deepseek-v4-pro` | DeepSeek V4 Pro | Heavy (thinking) |
| `deepseek-v4-flash` | DeepSeek V4 Flash | Light (fast) |
| `kimi-k2.6` | Kimi K2.6 | Alternative |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 | Alternative |
| `gpt-5-nano` | GPT 5 Nano | Light |
| `gpt-5-mini` | GPT 5 Mini | Light |


**Routing strategy:** Core agents (planner, architect, code-architect, tdd-guide, code-reviewer, security-reviewer) use **DeepSeek V4 Pro** for heavy reasoning. Execution agents and reviewers use **DeepSeek V4 Flash** for fast, cost-effective operation.

---

## Instinct Learning Subsystem

The instinct learning subsystem is a SQLite-backed knowledge graph that allows the agent system to learn from every session and improve over time.

### How It Works

1. **Auto-Capture** — Plugin hooks automatically record bash errors, session summaries, and key events to the knowledge graph.
2. **Pattern Extraction** — The system analyzes session data to identify recurring patterns, effective solutions, and common mistakes.
3. **Clustering** — Related learnings are clustered together using embedding similarity.
4. **Skill Evolution** — Clustered patterns can be promoted into reusable skills via `/skill-evolve`.

### Commands

| Command | Purpose |
|---------|---------|
| `/instinct-status` | View learned instincts, clusters, and history |
| `/instinct-export` | Export instincts to a shareable file |
| `/instinct-import` | Import instincts from file or project |
| `/evolve` | Cluster similar instincts for skill creation |
| `/promote` | Promote instincts to global scope |
| `/projects` | List all projects and instinct stats |
| `/skill-evolve` | Create a new skill from instinct cluster |

### Storage

Instincts are stored in `~/.opencode/instincts/` with project-specific and global scopes. The SQLite database is managed via `sql.js` (bundled SQLite implementation).

---

## Observability Pipeline

The observability pipeline tracks every agent call for performance monitoring, cost analysis, and anomaly detection.

### Metric Collection

Every agent call is recorded to `~/.opencode/metrics/agent-calls.jsonl`:

```
{
  "agent_name": "code-reviewer",
  "timestamp": "2026-06-13T10:00:00Z",
  "duration_ms": 2500,
  "token_usage": { "input": 800, "output": 300 },
  "success": true,
  "error_type": null,
  "tool": "Read"
}
```

### Dashboard Metrics

| Metric | Description |
|--------|-------------|
| Calls | Total calls per agent |
| Avg | Mean latency |
| P50 | Median latency (50th percentile) |
| P95 | 95th percentile latency |
| P99 | 99th percentile latency |
| Err% | Error rate (failed/total) |
| EstCost | Estimated cost at $30/M tokens |

### Alert Thresholds

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Per-agent error rate | > 5% | Investigate reliability, consider model switch |
| Per-agent P95 latency | > 30s | Check for stalls, timeouts |
| Overall error rate | > 10% | System-wide issue, escalate |

### Data Retention

- **30-day retention** with auto-prune
- **Non-destructive pruning** returns counts without mutation
- **Daily auto-prune** recommended via cron or startup hook

---

## Project Structure

```
agentic-operating-system/
├── AGENTS.md                   # Master agent instructions (orchestration rules)
├── opencode.json               # Main configuration (providers, models, agents)
├── tui.json                    # Terminal UI configuration (theme, keybinds)
├── install.sh                  # Installer script (copies to any project)
├── package.json                # Dependencies (TypeScript, Vitest, sql.js)
│
├── agents/                     # 76 agent definitions (.md + YAML frontmatter)
│   ├── planner.md
│   ├── tdd-guide.md
│   ├── code-reviewer.md
│   ├── security-reviewer.md
│   ├── architect.md
│   ├── code-architect.md
│   ├── uiux-designer.md
│   ├── ui-reviewer.md
│   ├── doc-updater.md
│   ├── refactor-cleaner.md
│   ├── e2e-runner.md
│   ├── bash-specialist.md
│   ├── code-explorer.md
│   ├── database-reviewer.md
│   ├── chief-of-staff.md
│   ├── loop-operator.md
│   ├── performance-optimizer.md
│   ├── node_modules/...        # Language reviewers (typescript-reviewer, etc.)
│   ├── ...                     # Build resolvers (rust-build-resolver, etc.)
│   └── ...                     # Framework specialists (django-reviewer, etc.)
│
├── skills/                     # 43 skill packs
│   ├── coding-standards/       #   Each has SKILL.md with instructions
│   ├── security-patterns/
│   ├── backend-patterns/
│   ├── frontend-patterns/
│   ├── api-design/
│   ├── database-patterns/
│   ├── deployment-patterns/
│   ├── error-handling/
│   ├── testing-patterns/
│   ├── git-workflow/
│   ├── docker-patterns/
│   ├── prompt-engineering/
│   └── ... (32 more)
│
├── commands/                   # 69 slash command definitions
│   ├── plan.md
│   ├── review.md
│   ├── security.md
│   ├── td.md
│   ├── build.md
│   ├── e2e.md
│   ├── perf.md
│   ├── instinct-status.md
│   ├── evolve.md
│   └── ... (59 more)
│
├── plugins/                    # Plugin engine (TypeScript)
│   ├── index.ts                #   Plugin entry point
│   └── hooks.ts                #   Lifecycle hook registration
│
├── tools/                      # 8 custom tools (TypeScript)
│   ├── index.ts                #   Tool registration
│   ├── run-tests.ts
│   ├── security-audit.ts
│   ├── format-code.ts
│   ├── lint-check.ts
│   ├── git-summary.ts
│   ├── changed-files.ts
│   ├── agent-metrics.ts
│   └── metrics-writer.ts
│
├── scripts/                    # Operational scripts
│   ├── hooks/                  #   12 lifecycle hooks
│   │   ├── config-protection.js
│   │   ├── desktop-notify.js
│   │   ├── mcp-health-check.js
│   │   ├── permission-auto-approve.js
│   │   ├── post-edit-console-warn.js
│   │   ├── post-edit-format.js
│   │   ├── post-edit-typecheck.js
│   │   ├── pre-bash-long-running.js
│   │   ├── pre-write-doc-warn.js
│   │   ├── session-idle-audit.js
│   │   ├── session-tracker.js
│   │   └── shell-env-detect.js
│   ├── check/                  #   Health check scripts
│   │   ├── doctor.js
│   │   ├── mcp-health.js
│   │   ├── quality-gate.js
│   │   ├── cost-tracker.js
│   │   ├── evaluate-session.js
│   │   └── skills-health.js
│   ├── detect/                 #   Environment detection
│   │   ├── package-manager.js
│   │   └── project.js
│   ├── validate/               #   Configuration validation
│   │   ├── agents.js
│   │   ├── commands.js
│   │   ├── skills.js
│   │   └── rules.js
│   ├── validate.js             #   Unified validation runner
│   └── instinct.js             #   Instinct learning subsystem
│
├── rules/                      # Per-language coding rules (25+ sets)
│   ├── common/                 #   Universal rules
│   │   ├── coding-style.md
│   │   ├── security.md
│   │   ├── testing.md
│   │   ├── git-workflow.md
│   │   └── patterns.md
│   ├── typescript/
│   ├── python/
│   ├── golang/
│   ├── rust/
│   ├── react/
│   ├── django/
│   ├── nextjs/
│   ├── nestjs/
│   ├── springboot/
│   ├── fastapi/
│   ├── kotlin/
│   ├── cpp/
│   ├── csharp/
│   ├── dart/
│   ├── flutter/
│   ├── swift/
│   ├── php/
│   ├── ruby/
│   ├── perl/
│   ├── laravel/
│   ├── java/
│   ├── angular/
│   ├── codeigniter/
│   └── web/                    #   Web standards
│       ├── accessibility.md
│       ├── performance.md
│       ├── responsive.md
│       └── patterns.md
│
├── instructions/               # Consolidated instruction docs
│   └── INSTRUCTIONS.md
│
├── tests/                      # Plugin tests (Vitest)
│   ├── agent-metrics.test.ts
│   ├── hooks-metrics.test.ts
│   └── metrics-writer.test.ts
│
└── routes/                     # Route handlers
    └── hello.ts
```

---

## Coding Standards

The system enforces universal coding standards across all agents:

### Immutability (Critical)

Always create new objects, never mutate existing ones:

```typescript
// BAD — mutation
user.name = "New Name"
array.push(item)

// GOOD — new copies
const updated = { ...user, name: "New Name" }
const newArray = [...array, item]
```

### File Organization

- Many small files over few large ones (200-400 lines typical, 800 max)
- Organize by feature/domain, not by type
- One exported component/class per file

### Function Design

- Functions under 50 lines, single responsibility
- Max 4 parameters — use options object for more
- No deep nesting (>4 levels) — use early returns
- Descriptive names: `verb + noun` (`getUserById`, `calculateTotal`)

### Error Handling

- Handle errors at every level — never silently swallow
- User-friendly messages in UI, detailed context in logs
- Fail fast with clear messages
- Distinguish operational (expected) from programmer (bug) errors

---

## Hook System

The system includes **12 lifecycle hooks** organized in **3 profiles**:

| Profile | Hooks | Purpose |
|---------|-------|---------|
| **Minimal** | session-tracker, shell-env-detect | Essential tracking only |
| **Standard** | All of minimal + desktop-notify, session-idle-audit, permission-auto-approve | Production use |
| **Strict** | All of standard + post-edit-console-warn, post-edit-format, post-edit-typecheck, pre-bash-long-running, pre-write-doc-warn, config-protection, mcp-health-check | Maximum safety |

Configure via `opencode.json` or apply with `/hookify`.

---

## Changelog

### v1.1.0 (2026-06-22)

**feat: Integrate UI UX Pro Max design intelligence skill**
- Added `ui-ux-pro-max` skill — 67 UI styles, 161 color palettes, 57 font pairings, 99 UX guidelines, 25 chart types, 17 tech stack guidelines, 161 industry reasoning rules (~1.6 MB knowledge base)
- Added BM25 search engine (`scripts/search.py`, `scripts/core.py`) with auto-domain detection across 11 domains
- Added Design System Generator (`scripts/design_system.py`) — AI-reasoned design system output with ANSI true-color swatches and Markdown format
- Added 12 CSV databases (styles, colors, typography, products, charts, landing, ux-guidelines, icons, fonts, reasoning, app-interface, react-performance)
- Added 17 stack-specific UI guideline files (React, Next.js, Vue, Svelte, Astro, Nuxt, Angular, Laravel, Flutter, SwiftUI, shadcn/ui, Tailwind, React Native, Jetpack Compose, Three.js, JavaFX)

**feat: Enhance uiux-designer agent with skill integration**
- Updated `agents/uiux-designer.md` — integrated ui-ux-pro-max skill loading, Design Decision → Data Source mapping table, Design System Generator workflow, and Design Decisions documentation in DESIGN.md handoff
- Added 12 new tool capability references to the agent prompt (CSV consultation, BM25 search, stack guidelines)

**fix: Add Skill tool permission to uiux-designer**
- Updated `AGENTS.md` Tool-to-Agent Permission Matrix — added `Skill` to uiux-designer allowed tools
- Updated `README.md` Tool Permissions Matrix — same change for documentation parity

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** using conventional commits:
   ```
   feat: add new agent for X
   fix: correct agent routing for Y
   docs: update skill documentation
   ```
4. **Run validation**:
   ```bash
   node scripts/validate.js
   ```
5. **Run tests**:
   ```bash
   npx vitest run
   ```
6. **Push to your fork** and open a Pull Request

### Development Guidelines

- Follow the coding standards (immutability, file organization, function design)
- Each agent needs a `.md` file with YAML frontmatter in `agents/`
- Each skill needs a `SKILL.md` in its own directory under `skills/`
- Tools go in `tools/` as TypeScript files
- Commands go in `commands/` as `.md` files
- Add tests for new tools and plugins in `tests/`
- Run validation before submitting

---

## License

MIT License

Copyright (c) 2026 OpenCode Agent System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
