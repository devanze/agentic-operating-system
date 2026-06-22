# OpenCode Agent System

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/devanze/agentic-operating-system)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Agents](https://img.shields.io/badge/agents-64-ff6b6b.svg)](#agent-ecosystem)
[![Skills](https://img.shields.io/badge/skills-44-845ef7.svg)](#skill-packs)
[![Commands](https://img.shields.io/badge/commands-70-ffd43b.svg)](#commands)
[![Tools](https://img.shields.io/badge/tools-8-20c997.svg)](#custom-tools)
[![MCP Servers](https://img.shields.io/badge/MCP-16-339af0.svg)](#mcp-servers)
[![Node](https://img.shields.io/badge/node-%3E%3D18.x-5fa04e.svg)](package.json)
[![TypeScript](https://img.shields.io/badge/typescript-6.x-3178c6.svg)](package.json)
[![Vitest](https://img.shields.io/badge/vitest-4.x-6b9e3f.svg)](package.json)

**Production-ready custom AI agent system for OpenCode** -- 64 specialized agents, 44 skill packs, 70 slash commands, 8 custom tools, 16 MCP servers, and an instinct learning subsystem. The system supercharges OpenCode with a disciplined team of specialized AI agents that plan, build, review, secure, and maintain your code.

---

## Table of Contents

- [Overview](#overview)
- [Why OpenCode Agent System?](#why-opencode-agent-system)
- [Features](#features)
- [Architecture](#architecture)
- [Model Routing Strategy](#model-routing-strategy)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Workflow Examples](#workflow-examples)
- [Agent Ecosystem](#agent-ecosystem)
- [Complexity-Gated Workflow](#complexity-gated-workflow)
- [Priority Rule Matrix](#priority-rule-matrix)
- [Skill Packs](#skill-packs)
- [Commands](#commands)
- [Custom Tools](#custom-tools)
- [MCP Servers](#mcp-servers)
- [Provider Models](#provider-models)
- [Instinct Learning Subsystem](#instinct-learning-subsystem)
- [Observability Pipeline](#observability-pipeline)
- [Performance and Cost Optimization](#performance--cost-optimization)
- [Coding Standards](#coding-standards)
- [Hook System](#hook-system)
- [Project Structure](#project-structure)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

OpenCode Agent System transforms OpenCode from a single-AI coding assistant into a **team of specialized AI agents** governed by strict orchestration rules, priority enforcement, and automated quality gates. Instead of one AI doing everything, a pure orchestrator delegates work to the right specialist: planners for architecture, tdd-guide for test-driven development, code-reviewer for quality, security-reviewer for vulnerability detection, uiux-designer for UI/UX design, and 58 more specialized agents covering 15 programming languages, 8 frameworks, and 14 domain specializations.

The system uses a **dual-model routing** strategy -- DeepSeek V4 Pro for heavy thinking (planning, architecture, review) and DeepSeek V4 Flash for light execution (formatting, exploration, simple edits) -- balancing quality with cost efficiency across 6 SumoPod models. Every agent call is tracked, every phase is gated, and every decision is logged.

---

## Why OpenCode Agent System?

### The Problem

Vanilla OpenCode provides a capable single-AI coding assistant, but complex software development requires more than a single generalist:

| Challenge | Single AI Assistant | OpenCode Agent System |
|-----------|-------------------|----------------------|
| Architecture decisions | Ad-hoc, no formal review | Architect designs, code-architect blueprints, tdd-guide implements, code-reviewer validates |
| Code quality | Inconsistent, depends on prompt | Mandatory TDD-first, automated review gates, P0-P3 priority enforcement |
| Security | Manual review, easy to miss | Automatic security-reviewer dispatch for auth/secrets/input changes |
| Scope creep | No boundary enforcement | Immutable goal lock written once; drift detection halts after 3 warnings |
| Context management | Single context window | 64 specialized agents each with focused context; orchestrator delegates |
| Team consistency | Varies by session | 44 skill packs enforce consistent standards across all code |
| Learning | No persistent memory | SQLite-backed instinct knowledge graph learns from every session |
| Cost control | Fixed model cost | Dual-model routing: v4-pro for heavy thinking, v4-flash for light tasks |

### Key Differentiators vs Vanilla OpenCode

- **Pure Orchestration** -- Orchestrator can never execute code. It delegates ALL work. Zero-tolerance policy.
- **Read-Only Reviewers** -- code-reviewer, security-reviewer, and all language reviewers have `Read`-only permissions. They inspect but never touch code.
- **State-Aware Execution** -- Every task writes to a canonical `states.json` with immutable goal block, structured steps, scoring, drift tracking, and events log.
- **Semantic Goal Scoring (Lv 5 Runtime)** -- Steps are scored 0.0-1.0 against success criteria. Low-scoring steps auto-rewritten. Highest-impact steps execute first.
- **E2E Workflow Coverage** -- From planner to architect to code-architect to tdd-guide to code-reviewer to security-reviewer to doc-updater, every phase is covered.

---

## Features

### Orchestration and Control

- **Pure Orchestration Model** -- The Orchestrator Agent has `edit: deny, write: deny` permissions. It uses the Task tool exclusively. Direct code execution is a critical violation. Zero tolerance.
- **Complexity-Gated Workflow** -- Task complexity determines the agent pipeline. Trivial tasks go directly to tdd-guide; medium+ tasks pass through planner to specialist to reviewer; greenfield projects go architect to specialist to reviewer.
- **Priority Rule Matrix (P0-P3)** -- Four-tier enforcement with automatic gates. P0 critical rules halt execution on violation. P1 mandatory rules block phase transitions. P2/P3 standard practices with warnings.
- **Escalation and Fallback Chains** -- Automatic retry and escalation on subagent failure (transient = retry, structural = escalate, terminal = halt). Max 3 attempts per task unit with full context preservation.
- **Goal Lock System** -- Immutable intent anchor written once at task creation. Every step validated against success criteria. Drift detection halts execution after 3 warnings.
- **Parallel Delegation** -- Independent subagents launch in parallel with max 5 concurrent agents. Dependent agents run sequentially.

### Development Workflow

- **TDD-First Mandatory** -- RED (write failing test) to GREEN (minimal implementation) to REFACTOR (clean while green). 80%+ coverage required. No exceptions.
- **Review Gates** -- Code review is mandatory after every change. Security review is automatic for auth/secrets/input changes. CRITICAL and HIGH issues must resolve before next phase.
- **Verification Loop** -- Tests + typecheck + lint + format + security scan after every change batch. All checks must pass to proceed.
- **State-Aware Execution** -- Executors read/write to a canonical `states.json` with immutable goal block, structured steps, scoring, drift tracking, and events log.
- **UI/UX Design Pipeline** -- planner to uiux-designer (with ui-ux-pro-max skill) to ui-reviewer (Claude Sonnet 4.6 vision + Playwright) to code-reviewer. Full visual review with real browser screenshots.

### Intelligence and Learning

- **Instinct Learning Subsystem** -- SQLite-backed knowledge graph that learns from every session. Extracts patterns, captures errors, clusters learnings, and evolves skills automatically.
- **Semantic Goal Scoring (Lv 5 Runtime)** -- Every step is scored (0.0-1.0) against success criteria. Low-scoring steps are auto-rewritten. Highest-impact steps execute first. Steps contradicting non-goals are rejected.
- **Strategic Context Compaction** -- Preserves task state, decisions, and progress while discarding verbose tool outputs. Prevents context window bloat during long sessions.
- **44 Skill Packs** -- Domain-specific instructions loaded on demand: coding standards, security, UI/UX design (ui-ux-pro-max with 67 styles, 161 palettes, 57 fonts, 99 UX rules), framework patterns, and more.

### Observability

- **Metrics Pipeline** -- Every agent call recorded to `agent-calls.jsonl` with latency, token usage, error type, and tool used.
- **Dashboard Aggregation** -- P50/P95/P99 latency, error rates, token costs per agent. 30-day data retention with auto-prune.
- **Alert Thresholds** -- Error rate over 5%, P95 latency over 30s trigger investigation.
- **Token Cost Correlation** -- Cross-reference agent-level spend with model tier optimization.

---

## Architecture

```
+------------------------------------------------------------------------------------+
|                              Orchestrator Agent                                    |
|                           (PURE ORCHESTRATOR -- read-only)                         |
|                        Delegates ALL work -- never executes code                   |
+-----------+------------------+---------------------------+------------------------+
            |                  |                           |
  +---------v----+    +-------v-----------+     +--------v-----------+
  |   Planner    |    |    Architect      |     |  Code Architect    |
  |  (v4-pro)    |    |    (v4-pro)       |     |    (v4-pro)        |
  |  Plans       |    |   Designs         |     |  Blueprints        |
  +---------+----+    +-------+-----------+     +--------+-----------+
            +------------------+--------------------------+
                               |
                   +-----------v-----------+
                   |      tdd-guide        |
                   |     (v4-pro)          |
                   |   TDD + Implement     |
                   +-----------+----------+
                               |
          +--------------------+----------------------------+
          |                    |                            |
  +-------v-------+    +------v-----------+     +----------v----------+
  | Code          |    |   Security       |     |    Doc-Updater      |
  | Reviewer      |    |   Reviewer       |     |                    |
  | (read-only)   |    |  (read-only)     |     |  Codemaps + Docs   |
  +---------------+    +------------------+     +--------------------+
                               |
          +--------------------+----------------------------+
          |                    |                            |
  +-------v--------------------v--------------------+       |
  |              80+ Specialized Agents              |       |
  +-------------------------------------------------+       |
  | 15 Language Reviewers  |  9 Build Resolvers     |       |
  | 8 Framework Specialists |  2 Role Specialists   |       |
  | 14 Domain Specialists   |  1 UI/UX Designer    |       |
  | 1 UI Reviewer (Claude Sonnet 4.6 Vision)        |       |
  +-------------------------------------------------+       |
                                                             |
          +--------------------------------------------------+
          |
  +-------v----------------------------------------------------------+
  |                    Supporting Infrastructure                      |
  +-----------+----------+----------+----------+-----------+----------+
  | 44 Skill  | 70 Cmds  | 8 Tools  | 16 MCP   | Instinct  | Observ.  |
  | Packs     |          |          | Servers  | Learning  | Pipeline |
  +-----------+----------+----------+----------+-----------+----------+
```

---

## Model Routing Strategy

The system employs a **dual-model routing** architecture that assigns the right AI model to the right task, balancing reasoning depth, response speed, and operational cost.

| Routing Tier | Model | Agents | Use Case | Avg Response |
|-------------|-------|--------|----------|-------------|
| Heavy (Thinking) | `deepseek-v4-pro` | Planner, Architect, Code-Architect, tdd-guide, Code-Reviewer, Security-Reviewer | Architecture design, complex planning, multi-step reasoning, code review, security audit | 2-8s |
| Light (Fast) | `deepseek-v4-flash` | All execution agents, language reviewers, build resolvers, specialists | Code generation, formatting, exploration, linting, test execution | <2s |
| Vision | `claude-sonnet-4-6` | ui-reviewer | Visual UI analysis with Playwright screenshots, accessibility snapshots | 3-5s |
| Light Alternative | `gpt-5-nano` | Cost-sensitive execution | Budget-constrained environments | <1s |
| Light Alternative | `gpt-5-mini` | Bulk processing | High-volume, low-criticality tasks | <1s |
| Alternative | `kimi-k2.6` | Fallback reasoning | When primary model unavailable | 2-6s |

### Routing Decision Flow

```
Agent triggered
    |
    +-- Is this a thinking-heavy agent? --yes--+ Route to deepseek-v4-pro
    |
    +-- Is this the ui-reviewer? ---------yes--+ Route to claude-sonnet-4-6
    |
    +-- Is this cost-sensitive? ----------yes--+ Route to gpt-5-nano/mini
    |
    +-- Otherwise -----------------------------+ Route to deepseek-v4-flash
```

### Model Capabilities Comparison

| Capability | deepseek-v4-pro | deepseek-v4-flash | claude-sonnet-4-6 | gpt-5-nano | gpt-5-mini | kimi-k2.6 |
|-----------|:---------------:|:-----------------:|:-----------------:|:-----------:|:-----------:|:---------:|
| Reasoning Depth | 5/5 | 3/5 | 4/5 | 2/5 | 3/5 | 4/5 |
| Code Generation | 5/5 | 4/5 | 4/5 | 2/5 | 3/5 | 4/5 |
| Speed | 3/5 | 5/5 | 3/5 | 5/5 | 5/5 | 3/5 |
| Cost Efficiency | 2/5 | 5/5 | 3/5 | 5/5 | 4/5 | 4/5 |
| Vision/UI Analysis | - | - | 5/5 | - | - | - |
| Tool Accuracy | 5/5 | 4/5 | 4/5 | 2/5 | 3/5 | 4/5 |
| Context Handling | 5/5 | 4/5 | 4/5 | 3/5 | 3/5 | 4/5 |

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

The installer copies all agents, skills, commands, plugins, tools, rules, scripts, and configuration files into the project's `.opencode/` directory. Your project is immediately ready with all 64 agents, 44 skill packs, and full orchestration.

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
# Run the health check -- validates all agent configs, skills, and tools
node scripts/check/doctor.js

# Validate agent configurations
node scripts/validate/agents.js

# Validate skill packs
node scripts/validate/skills.js

# Check MCP server connectivity
node scripts/check/mcp-health.js
```

---

## Quick Start

### 1. Open a Project

Launch OpenCode in a project that has `.opencode/` installed:

```bash
opencode /path/to/your/project
```

### 2. Use Slash Commands

The system provides **70 slash commands**. Here are the most essential:

| Command | Purpose | Typical Use |
|---------|---------|-------------|
| `/plan` | Create implementation plan | Complex features, refactoring |
| `/td` | Start test-driven development | New features, bug fixes |
| `/review` | Run code review on current changes | After any code modification |
| `/security` | Run security vulnerability audit | Before commits, sensitive code |
| `/build` | Fix build/compile errors | Build failures |
| `/explore` | Explore and map codebase structure | Understanding new codebases |
| `/docs` | Update documentation from code | After API or architecture changes |
| `/refactor` | Clean up dead code | Code maintenance |
| `/e2e` | Run end-to-end tests | Critical user flows |
| `/perf` | Analyze performance bottlenecks | Slow components or queries |
| `/coverage` | Check test coverage | Before merging |
| `/quality` | Run quality gate checks | Pre-commit validation |
| `/orchestrate` | Multi-agent orchestration | Complex multi-step tasks |

### 3. Your First Feature: Authentication (Full Workflow)

```bash
# Step 1: Plan the feature
/plan "Add user authentication with JWT"

# What happens under the hood:
#   1. planner agent creates PLAN.md with implementation steps
#   2. doc-updater writes state tracking files (states.json, events.log)
#   3. tdd-guide agent executes TDD: writes tests first, then implements
#   4. code-reviewer agent reviews all changes
#   5. security-reviewer agent audits auth logic for vulnerabilities
#   6. doc-updater updates documentation and codemaps

# Step 2: Review results
/review

# Step 3: Check quality gates
/quality

# Step 4: Verify test coverage
/coverage
```

### 4. Your First UI Design (UI/UX Workflow)

```bash
# Design a landing page with full visual review
/ux "Design a modern SaaS landing page with hero, features, pricing, and CTA"

# What happens under the hood:
#   1. planner creates PLAN.md for the design task
#   2. uiux-designer loads the ui-ux-pro-max skill (67 styles, 161 palettes, 57 fonts)
#   3. uiux-designer generates design decisions, color palette, typography, layout
#   4. uiux-designer outputs DESIGN.md handoff document with code
#   5. tdd-guide implements the design as React components
#   6. ui-reviewer (Claude Sonnet 4.6 vision) captures Playwright screenshots
#   7. ui-reviewer analyzes visual output vs source code for issues
#   8. code-reviewer validates code quality and accessibility
#   9. doc-updater updates documentation

# Step 2: Run UI-specific review
/ui-reviewer

# Step 3: Standard code review
/review
```

### 5. Your First Code Review

```bash
# After making changes, run a comprehensive review
/review

# The code-reviewer agent checks:
#   - Immutability compliance
#   - File organization (200-400 lines per file, max 800)
#   - Function design (< 50 lines, single responsibility)
#   - Error handling coverage
#   - Input validation at boundaries
#   - Naming conventions (verb + noun)
#   - No hardcoded values or deep nesting

# For auth/security-sensitive changes, chain with:
/security

# For TypeScript-specific review:
/ts-review
```

---

## Workflow Examples

### Full UI/UX Design Workflow

This end-to-end workflow takes a design concept from ideation to production-ready code with visual verification.

```
User: "Design a dashboard for a project management app"
  |
  +-- 1. planner
  |     +-- Creates PLAN.md with design scope, constraints, and deliverables
  |
  +-- 2. uiux-designer (with ui-ux-pro-max skill)
  |     +-- Loads 67 UI styles, 161 color palettes, 57 font pairings
  |     +-- Consults 99 UX guidelines for dashboard best practices
  |     +-- Generates design system (colors, typography, spacing tokens)
  |     +-- Creates component designs (sidebar, kanban, charts, nav)
  |     +-- Outputs DESIGN.md handoff document
  |     +-- Uses BM25 search engine for domain-specific patterns
  |
  +-- 3. tdd-guide
  |     +-- Writes component tests (RED)
  |     +-- Implements components from DESIGN.md (GREEN)
  |     +-- Refactors with design tokens (REFACTOR)
  |
  +-- 4. ui-reviewer (Claude Sonnet 4.6 vision)
  |     +-- Launches Playwright browser
  |     +-- Captures screenshots at multiple viewports (375px, 768px, 1440px)
  |     +-- Analyzes: layout alignment, spacing, color contrast, touch targets
  |     +-- Checks: console errors, network request failures
  |     +-- Reports visual regressions with screenshot evidence
  |
  +-- 5. code-reviewer
  |     +-- Validates React patterns, accessibility (ARIA), keyboard nav
  |     +-- Checks design token usage consistency
  |     +-- Approves or flags issues
  |
  +-- 6. doc-updater
  |     +-- Updates codemaps and component documentation
  |
  +-- Result: Production-ready dashboard with visual QA evidence
```

### Full Backend Feature Workflow

```
User: "Add a payment processing endpoint with Stripe"
  |
  +-- 1. planner
  |     +-- Creates PLAN.md: endpoint design, webhook handling, idempotency
  |
  +-- 2. architect
  |     +-- Creates ARCHITECTURE.md: data flow, error handling, retry policy
  |
  +-- 3. code-architect
  |     +-- Creates BLUEPRINT.md: service layer, repository, DTOs, validation
  |
  +-- 4. tdd-guide
  |     +-- Writes integration tests for payment endpoint
  |     +-- Implements: controller to service to repository to Stripe client
  |     +-- Adds: idempotency key handling, webhook signature verification
  |     +-- Ensures 80%+ coverage on all new code
  |
  +-- 5. code-reviewer
  |     +-- Validates error handling, input validation, response format
  |     +-- Checks repository pattern compliance
  |
  +-- 6. security-reviewer
  |     +-- Scans for hardcoded API keys, Stripe secret exposure
  |     +-- Validates webhook signature verification
  |     +-- Checks PII/PCI compliance in request/response payloads
  |     +-- Confirms rate limiting and retry safety
  |
  +-- 7. doc-updater
  |     +-- Updates API documentation with new endpoint specs
  |
  +-- Result: Production-ready payment endpoint with security clearance
```

### Bug Fix Workflow

```
User: "Login button is misaligned on mobile viewports"
  |
  +-- 1. tdd-guide (trivial fix, direct dispatch)
  |     +-- Reads current Button.tsx and breakpoints.css
  |     +-- Identifies alignment issue in responsive styles
  |     +-- Writes test that captures the broken alignment
  |     +-- Fixes flex alignment in CSS
  |     +-- Verifies test passes
  |     +-- Runs lint + typecheck
  |
  +-- 2. code-reviewer
  |     +-- Confirms fix does not break desktop layout
  |     +-- Verifies no regression in existing tests
  |
  +-- 3. (Optional) ui-reviewer
  |     +-- Captures screenshots at 375px and 1440px to verify fix
  |
  +-- Result: Button centered on all viewports, all tests green
```

---

## Agent Ecosystem

The system includes **64 specialized agents** across 9 categories, routed by task complexity and domain.

### When to Use Which Agent -- Decision Guide

| When you need to... | Use this agent | Why |
|--------------------|----------------|-----|
| Plan a complex feature | `planner` | Creates structured implementation plan with dependency ordering |
| Design system architecture | `architect` | Produces ARCHITECTURE.md with scalability, trade-offs, decisions |
| Design a feature from existing patterns | `code-architect` | Analyzes codebase, produces BLUEPRINT.md with pattern alignment |
| Write code (TDD) | `tdd-guide` | Writes tests first, implements, refactors -- mandatory workflow |
| Review code quality | `code-reviewer` | Read-only; checks style, patterns, error handling, immutability |
| Audit security | `security-reviewer` | Read-only; scans deps, secrets, anti-patterns |
| Fix build errors | `build-error-resolver` | Analyzes errors incrementally, fixes step by step |
| Design a UI | `uiux-designer` | Loads ui-ux-pro-max skill with 67 styles, 161 palettes, BM25 search |
| Review UI visually | `ui-reviewer` | Claude Sonnet 4.6 vision + Playwright browser screenshots |
| Fix performance | `performance-optimizer` | Baselines metrics first, then optimizes with before/after |
| Run E2E tests | `e2e-runner` | Defines critical flows, generates + runs tests |
| Explore a codebase | `code-explorer` | Read-only; maps structure, finds entry points |
| Update docs | `doc-updater` | Generates codemaps from AST, updates READMEs |
| Clean up dead code | `refactor-cleaner` | Verifies no behavior change via tests after cleanup |
| Review database schemas | `database-reviewer` | Read-only; analyzes schema design, indexing, migrations |
| Operate a long loop | `loop-operator` | Checkpointing, stall detection, iteration limits |
| Get live library docs | `docs-lookup` | Fetches via Context7 MCP server |

### Core Agents (v4-pro -- Thinking Heavy)

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **planner** | Implementation planning | Complex features, refactoring |
| **architect** | System design and scalability | Architectural decisions |
| **code-architect** | Feature architecture from codebase patterns | Feature design, blueprint |
| **tdd-guide** | Test-driven development | New features, bug fixes |
| **code-reviewer** | Code quality and maintainability | After writing/modifying code |
| **security-reviewer** | Vulnerability detection | Before commits, sensitive code |
| **build-error-resolver** | Fix build/type errors | When build fails |
| **django-build-resolver** | Fix Django migration/config errors | Django build failures |

### Execution Agents (v4-flash -- Light and Fast)

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **bash-specialist** | Safe bash command execution | Shell commands needed |
| **e2e-runner** | End-to-end testing | Critical user flows |
| **refactor-cleaner** | Dead code cleanup | Code maintenance |
| **doc-updater** | Documentation and codemaps | Updating docs |
| **database-reviewer** | DB schema and query review | Schema changes, queries |
| **code-explorer** | Codebase exploration | Understanding codebases |
| **chief-of-staff** | Communication triage and draft replies | Multi-channel messages |
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

| Agent | Role | When | Model |
|-------|------|------|-------|
| **uiux-designer** | Design systems, usability, motion, Figma-to-code | UI/UX design phase | deepseek-v4-flash + ui-ux-pro-max skill |
| **ui-reviewer** | Visual UI review with Playwright + vision AI | After UI changes, before merge | **claude-sonnet-4-6** (vision) |

### Specialist Agents (v4-flash)

| Agent | Purpose |
|-------|---------|
| **performance-optimizer** | Find and fix performance bottlenecks |
| **harness-optimizer** | Optimize agent config for reliability and cost |
| **healthcare-reviewer** | HIPAA, PHI, HL7/FHIR compliance |
| **network-architect** | Network topology and security design |
| **mle-reviewer** | Production ML pipelines and MLOps |
| **silent-failure-hunter** | Find bugs with no error messages |
| **comment-analyzer** | Review comment quality and usefulness |
| **type-design-analyzer** | Review type definitions and data models |
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
| ui-reviewer | `Read`, `Write`, `Glob`, `Grep` (Playwright MCP for browser) |
| doc-updater | `Read`, `Write`, `Edit`, `Glob`, `Grep`, `filesystem_move_file` |
| refactor-cleaner | `Bash`, `Write`, `Edit`, `Read`, `Glob`, `Grep` |
| bash-specialist | `Bash`, `Read`, `Write` (bash execution only) |
| e2e-runner | `Bash`, `Read`, `Glob`, `Grep`, `Write`, `Edit` |
| performance-optimizer | `Bash`, `Read`, `Glob`, `Grep`, `Write`, `Edit` |
| Language reviewers | `Read`, `Glob`, `Grep` ONLY |
| Build resolvers | `Bash`, `Read`, `Write`, `Edit`, `Glob`, `Grep` |
| general | `Bash`, `Write`, `Edit`, `Read`, `Glob`, `Grep`, `Task` |

---

## Complexity-Gated Workflow

Task complexity determines which agents handle the work:

| Task Complexity | Flow | Pre-check |
|-----------------|------|-----------|
| Trivial (typo, rename, single-line) | tdd-guide to code-reviewer | Verify it is truly trivial first |
| Small (1 file, clear scope) | tdd-guide to code-reviewer | Confirm scope boundary |
| Medium+ (3+ files, new feature, refactor) | planner to specialist to code-reviewer | Planner output approved before code |
| Greenfield (new project) | architect to specialist to code-reviewer | Architect designs, then dispatch |
| UI/UX (design, Figma-to-code) | planner to uiux-designer to code-reviewer | Design review before/alongside code |
| UI Review (visual check, screenshot) | ... to ui-reviewer to code-reviewer | UI review after implementation, before merge |
| Security (auth, API keys, input) | ... to security-reviewer (mandatory) | After code-reviewer |
| Build/compile error | build-error-resolver or django-build-resolver | Fix incrementally, verify after each fix |
| Performance | performance-optimizer | Baseline metrics before optimization |
| Docs | doc-updater | Only update docs; do not create new top-level files |
| Cleanup | refactor-cleaner | Verify no behavior change via tests after cleanup |

### Escalation Chains

When a subagent fails, the system escalates automatically:

| Failure Type | Escalation Chain | Max Depth |
|-------------|------------------|-----------|
| Compile/Test failure | tdd-guide to build-error-resolver to planner | 3 |
| Build/config error | build-error-resolver to planner to architect | 3 |
| Generic agent failure | any-agent to general to planner to architect | 4 |

**Escalation rules:**
- Preserve original task context across all retries
- Max 3 total attempts per task unit (including original)
- Classify failures: TRANSIENT (retry same agent once) / STRUCTURAL (escalate) / TERMINAL (halt, notify)
- Log all escalations to agent-calls.jsonl
- After max depth exhausted: HALT, notify user

---

## Priority Rule Matrix

The system enforces a four-tier priority system with automatic gates:

| Level | Meaning | Consequence |
|-------|---------|-------------|
| P0 -- Critical | Must never be violated. No exceptions. | Task halted. Fix before continuing. |
| P1 -- Mandatory | Must always be followed. | Blocked -- cannot proceed to next phase. |
| P2 -- Standard | Best practice, expected in all code. | Warning -- flagged in review. |
| P3 -- Guideline | Recommended, use judgment. | Note -- reviewer may suggest. |

**Enforcement gates:** Pre-task check, In-task monitoring, Post-task verification, Review gate.

### Layer Precedence

Execution respects a strict layer hierarchy:

```
Layer 1 (P0): EXECUTION SAFETY    -- dependency resolution, deterministic order
Layer 2 (P0): GOAL INTEGRITY      -- pre-filter reject, per-step validator, drift limit
Layer 3 (P2): SCORING OPTIMIZATION -- score valid steps, reorder within groups, auto-rewrite
```

Dependencies always beat scoring. Goal lock pre-filter runs before scoring. Scoring reorders within dependency groups only.

---

## Skill Packs

The system ships **44 skill packs** that provide specialized instructions and workflows. Skills are loaded on demand when a task matches their description, injecting domain-specific knowledge directly into agent prompts.

### Design and UI

| Skill | Description | Key Capabilities |
|-------|-------------|------------------|
| **ui-ux-pro-max** | Ultimate UI/UX design intelligence with 67 styles, 161 color palettes, 57 font pairings, 99 UX guidelines, and automated design system generation | 67 UI styles, 161 color palettes, 57 font pairings, 99 UX guidelines, 25 chart types, 17 tech stacks, 161 industry reasoning rules, BM25 search engine, Design System Generator, 12 CSV databases, 17 stack-specific UI guidelines |
| **accessibility** | Web accessibility (a11y) patterns covering WCAG compliance, semantic HTML, ARIA, keyboard navigation, screen readers, and testing | WCAG 2.1 AA/AAA, ARIA roles and properties, focus management, color contrast ratios, screen reader testing |
| **design-system** | Design system patterns covering component libraries, tokens, theming, responsive design, and design tokens | Component architecture, design tokens (color, typography, spacing), theme switching, responsive breakpoints |

### Coding Standards and Patterns

| Skill | Description |
|-------|-------------|
| **coding-standards** | Universal coding standards -- immutability, file organization, function design, naming conventions, code quality |
| **security-patterns** | Secret management, input validation, injection prevention, threat modeling, secure defaults |
| **backend-patterns** | Layered architecture, repository pattern, API design, error handling, logging, service design |
| **frontend-patterns** | React component design, state management, performance optimization, responsive layouts |
| **api-design** | REST, GraphQL, versioning, pagination, error handling, rate limiting, OpenAPI documentation |
| **database-patterns** | Schema design, indexing, migrations, transactions, connection management, query optimization |
| **deployment-patterns** | CI/CD, Docker, environment management, zero-downtime deploys, rollback strategies, monitoring |
| **error-handling** | Error types, exception design, recovery strategies, user-friendly messages, defensive programming |
| **testing-patterns** | Unit/integration/E2E, test structure, mocking, coverage targets, TDD workflow |
| **git-workflow** | Branching strategies, commit conventions, PR best practices, code review etiquette, release management |
| **docker-patterns** | Dockerfiles, multi-stage builds, image optimization, security, development workflows |
| **prompt-engineering** | Structuring instructions, effective delegation, context management, communication patterns |

### Language-Specific Skills

| Skill | Language/Framework |
|-------|-------------------|
| **rust-patterns** | Rust ownership, borrowing, lifetimes, error handling, async/tokio, testing |
| **kotlin-patterns** | Kotlin scope functions, coroutines, flows, sealed classes, extension functions, null safety |
| **cpp-coding-standards** | C++ RAII, smart pointers, rule of 5, const correctness, modern C++17/20 |
| **csharp-testing** | C# xUnit/NUnit, Moq, FluentAssertions, TestContainers integration testing |
| **swiftui-patterns** | SwiftUI View composition, state management, navigation, async/await |
| **dart-flutter-patterns** | Dart null safety, async, widget composition, state management, navigation |

### Framework-Specific Skills

| Skill | Framework |
|-------|-----------|
| **react-performance** | React memoization, code splitting, virtualization, image optimization, bundle analysis |
| **nextjs-turbopack** | Next.js App Router, Server Components, streaming, caching, route handlers |
| **nestjs-patterns** | NestJS modules, decorators, DI, guards, interceptors, pipes, testing |
| **django-patterns** | Django models, querysets, class-based views, serializers, admin, signals, testing |
| **fastapi-patterns** | FastAPI Pydantic models, DI, middleware, background tasks, WebSockets |
| **springboot-patterns** | Spring Boot layered architecture, JPA, REST controllers, security, testing |
| **quarkus-patterns** | Quarkus reactive programming, Panache, CDI, RESTEasy, native compilation |

### Infrastructure and Tools

| Skill | Description |
|-------|-------------|
| **prisma-patterns** | Prisma schema design, migrations, query optimization, transactions, middleware |
| **redis-patterns** | Caching, sessions, rate limiting, pub/sub, sorted sets, distributed locks |
| **kubernetes-patterns** | Deployments, services, ConfigMaps, health checks, autoscaling, RBAC |
| **mcp-server-patterns** | MCP tool design, resource exposure, prompt templates, transport configuration |
| **hexagonal-architecture** | Ports and adapters, domain isolation, dependency inversion, testing |

### Agent and System Skills

| Skill | Description |
|-------|-------------|
| **agent-harness-construction** | Agent definition, tool binding, hook systems, model routing, session management |
| **autonomous-loops** | Goal definition, checkpointing, stall detection, iteration limits, safe intervention |
| **team-agent-orchestration** | Parallel execution, agent coordination, result merging, dependency management |
| **continuous-learning** | Pattern extraction, knowledge distillation, skill evolution, feedback loops |
| **cost-tracking** | Token counting, cost estimation, budget alerts, optimization strategies |
| **production-audit** | Error handling, logging, monitoring, security, deployment, disaster recovery |
| **strategic-compact** | Context compaction, preservation, state recovery, what to discard |
| **search-first** | Search codebase/docs for existing solutions before writing new code |
| **verification-loop** | Tests + lint + typecheck + security + behavior verification after changes |
| **observability-pipeline** | Metric collection (agent-calls.jsonl), dashboard (P50/P95/P99), alert thresholds |
| **agent-fallback** | Escalation chains, retry rules, max depth limits |

---

## Commands

The system provides **70 slash commands** organized by category.

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

### Review and Quality

| Command | Description |
|---------|-------------|
| `/review` | Run comprehensive code review |
| `/security` | Run security vulnerability audit |
| `/quality` | Run quality gate checks |
| `/db-review` | Review database schema and queries |
| `/ui-reviewer` | Visual UI review with Playwright + Claude Sonnet 4.6 vision |
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

### Build and Deploy

| Command | Description |
|---------|-------------|
| `/rust-build` | Fix Rust/Cargo build errors |
| `/go-build` | Fix Go build/vet errors |
| `/kotlin-build` | Fix Kotlin/Gradle build errors |
| `/cpp-build` | Fix C++/CMake build errors |
| `/django-build` | Fix Django migration/config errors |

### Intelligence and Learning

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
| `/chief` | Start chief-of-staff communication triage |
| `/skill-create` | Create a new skill pack |
| `/e2e-test` | Run specific end-to-end test |

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

| Model | Name | Tier | Primary Agents |
|-------|------|------|---------------|
| `deepseek-v4-pro` | DeepSeek V4 Pro | Heavy (thinking) | Planner, Architect, Code-Architect, tdd-guide, Code-Reviewer, Security-Reviewer |
| `deepseek-v4-flash` | DeepSeek V4 Flash | Light (fast) | All execution agents, language reviewers, build resolvers, specialists |
| `kimi-k2.6` | Kimi K2.6 | Alternative | Fallback reasoning |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 | Vision | ui-reviewer (Playwright screenshots + vision AI) |
| `gpt-5-nano` | GPT 5 Nano | Light | Cost-sensitive execution |
| `gpt-5-mini` | GPT 5 Mini | Light | Bulk processing |

**Routing strategy:** Core agents (planner, architect, code-architect, tdd-guide, code-reviewer, security-reviewer) use **DeepSeek V4 Pro** for heavy reasoning. Execution agents and reviewers use **DeepSeek V4 Flash** for fast, cost-effective operation. The **ui-reviewer** uses **Claude Sonnet 4.6** specifically for its vision capabilities.

---

## Instinct Learning Subsystem

The instinct learning subsystem is a SQLite-backed knowledge graph that allows the agent system to learn from every session and improve over time.

### How It Works

1. **Auto-Capture** -- Plugin hooks automatically record bash errors, session summaries, and key events to the knowledge graph.
2. **Pattern Extraction** -- The system analyzes session data to identify recurring patterns, effective solutions, and common mistakes.
3. **Clustering** -- Related learnings are clustered together using embedding similarity.
4. **Skill Evolution** -- Clustered patterns can be promoted into reusable skills via `/skill-evolve`.

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

```json
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

## Performance and Cost Optimization

### Model Tier Selection

The dual-model routing strategy directly impacts both performance and cost:

| Model | Cost Index | Use When |
|-------|-----------|----------|
| deepseek-v4-pro | High (x5) | Complex reasoning, architecture, security review |
| deepseek-v4-flash | Low (x1) | Code generation, linting, exploration, most agents |
| claude-sonnet-4-6 | Medium (x3) | Vision/UI analysis only |
| gpt-5-nano | Lowest (x0.5) | Budget-constrained bulk tasks |
| gpt-5-mini | Low (x0.75) | High-volume, low-criticality |

### Cost Optimization Strategies

1. **Use the right model for the job** -- v4-flash handles 80% of agent calls
2. **Instinct learning reduces retry cost** -- learned patterns prevent repeated mistakes
3. **Strategic context compaction** -- prevents context window waste
4. **Observability pipeline** -- identifies expensive agents and slow queries
5. **30-day data auto-prune** -- prevents storage bloat

---

## Coding Standards

The system enforces universal coding standards across all agents:

### Immutability (Critical)

Always create new objects, never mutate existing ones:

```typescript
// BAD -- mutation
user.name = "New Name"
array.push(item)

// GOOD -- new copies
const updated = { ...user, name: "New Name" }
const newArray = [...array, item]
```

### File Organization

- Many small files over few large ones (200-400 lines typical, 800 max)
- Organize by feature/domain, not by type
- One exported component/class per file

### Function Design

- Functions under 50 lines, single responsibility
- Max 4 parameters -- use options object for more
- No deep nesting (>4 levels) -- use early returns
- Descriptive names: `verb + noun` (`getUserById`, `calculateTotal`)

### Error Handling

- Handle errors at every level -- never silently swallow
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
│   ├── planner.md              # Core agents (planner, tdd-guide, reviewers)
│   ├── tdd-guide.md
│   ├── code-reviewer.md
│   ├── security-reviewer.md
│   ├── architect.md
│   ├── code-architect.md
│   ├── uiux-designer.md
│   ├── ui-reviewer.md          # Claude Sonnet 4.6 vision UI review
│   ├── doc-updater.md
│   ├── refactor-cleaner.md
│   ├── e2e-runner.md
│   ├── bash-specialist.md
│   ├── code-explorer.md
│   ├── database-reviewer.md
│   ├── chief-of-staff.md
│   ├── loop-operator.md
│   ├── performance-optimizer.md
│   ├── ...                     # Language reviewers, build resolvers, specialists
│
├── skills/                     # 44 skill packs
│   ├── coding-standards/       #   Each has SKILL.md with instructions
│   ├── security-patterns/
│   ├── backend-patterns/
│   ├── ui-ux-pro-max/          # Ultimate UI/UX design intelligence
│   ├── accessibility/
│   ├── design-system/
│   ├── frontend-patterns/
│   ├── api-design/
│   ├── database-patterns/
│   ├── react-performance/
│   └── ... (34 more)
│
├── commands/                   # 70 slash command definitions
│   ├── plan.md
│   ├── review.md
│   ├── security.md
│   ├── td.md
│   ├── ui-reviewer.md          # New UI review command
│   ├── build.md
│   ├── e2e.md
│   └── ... (63 more)
│
├── plugins/                    # Plugin engine (TypeScript)
│   ├── index.ts                #   Plugin entry point
│   └── hooks.ts                #   Lifecycle hook registration
│
├── tools/                      # 8 custom tools (TypeScript)
│   ├── index.ts
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
│   ├── check/                  #   Health check scripts
│   ├── detect/                 #   Environment detection
│   ├── validate/               #   Configuration validation
│   ├── validate.js             #   Unified validation runner
│   └── instinct.js             #   Instinct learning subsystem
│
├── rules/                      # Per-language coding rules (25+ sets)
│   ├── common/                 #   Universal rules
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

## Changelog

### v1.2.0 (2026-06-22)

**feat: Add /ui-reviewer slash command**
- Added `commands/ui-reviewer.md` -- new slash command for visual UI review workflow
- Updated command count to 70 across documentation

**feat: Switch ui-reviewer model to Claude Sonnet 4.6**
- Updated `agents/ui-reviewer.md` -- model changed from GPT-5 Nano to `sumopod/claude-sonnet-4-6` for superior vision capabilities
- Added temperature: 0.1 for consistent visual analysis
- Enhanced description: "GPT-5 Nano vision model" updated to reference Claude Sonnet 4.6 for Playwright screenshot analysis

**docs: Update ui-reviewer description**
- Clarified ui-reviewer scope vs other reviewers (code-reviewer, react-reviewer, performance-optimizer, security-reviewer, uiux-designer)
- Added boundary table defining what each reviewer owns

**docs: Reflect single provider (sumopod)**
- Updated documentation to reflect single SumoPod AI provider with 6 models
- Removed dual-provider references (SumoPod + OpenRouter)

---

### v1.1.0 (2026-06-22)

**feat: Integrate UI UX Pro Max design intelligence skill**
- Added `ui-ux-pro-max` skill -- 67 UI styles, 161 color palettes, 57 font pairings, 99 UX guidelines, 25 chart types, 17 tech stack guidelines, 161 industry reasoning rules (~1.6 MB knowledge base)
- Added BM25 search engine (`scripts/search.py`, `scripts/core.py`) with auto-domain detection across 11 domains
- Added Design System Generator (`scripts/design_system.py`) -- AI-reasoned design system output with ANSI true-color swatches and Markdown format
- Added 12 CSV databases (styles, colors, typography, products, charts, landing, ux-guidelines, icons, fonts, reasoning, app-interface, react-performance)
- Added 17 stack-specific UI guideline files (React, Next.js, Vue, Svelte, Astro, Nuxt, Angular, Laravel, Flutter, SwiftUI, shadcn/ui, Tailwind, React Native, Jetpack Compose, Three.js, JavaFX)

**feat: Enhance uiux-designer agent with skill integration**
- Updated `agents/uiux-designer.md` -- integrated ui-ux-pro-max skill loading, Design Decision to Data Source mapping table, Design System Generator workflow, and Design Decisions documentation in DESIGN.md handoff
- Added 12 new tool capability references to the agent prompt (CSV consultation, BM25 search, stack guidelines)

**fix: Add Skill tool permission to uiux-designer**
- Updated `AGENTS.md` Tool-to-Agent Permission Matrix -- added `Skill` to uiux-designer allowed tools
- Updated `README.md` Tool Permissions Matrix -- same change for documentation parity

---

### v1.0.0 (2026-06-13)

**feat: Initial release**
- 64 specialized agents across 9 categories
- 43 skill packs (expanded to 44 in v1.1.0)
- 69 slash commands (expanded to 70 in v1.2.0)
- 8 custom tools
- 16 MCP servers
- 12 lifecycle hooks
- Instinct learning subsystem with SQLite-backed knowledge graph
- Dual-model routing (v4-pro for heavy, v4-flash for light)
- Pure orchestrator model with read-only reviewers
- Complexity-gated workflow with escalation chains
- Priority rule matrix (P0-P3)
- Semantic goal scoring (Lv 5 Runtime)
- Observability pipeline with agent-calls.jsonl

---

## Contributing

Contributions are welcome! Here is how to get started:

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
