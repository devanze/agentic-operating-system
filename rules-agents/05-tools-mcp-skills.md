# Tools, MCP Servers & Skills

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
