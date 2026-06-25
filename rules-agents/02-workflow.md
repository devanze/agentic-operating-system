# Development Workflow — PRIORITY P0/P1

## ⚠️ P1: MANDATORY Workflow Sequence

Every development task follows this **unskippable** sequence:

```
1. PLAN   → New project/empty folder: architect agent generates ARCHITECTURE.md + PROGRESS.md. Crash-prone or 3+ files: planner agent generates PLAN.md + PROGRESS.md. Feature architecture: code-architect generates BLUEPRINT.md + PROGRESS.md. Doc-updater then writes state tracking files (states.json, events.log, dependency-graph.json) into `status/` (greenfield) or `state/` (patch). Doc-updater MUST populate states.json with immutable `goal` block BEFORE orchestrator dispatches execution agent. **After dispatching doc-updater for state setup, WAIT for "State ready" confirmation before dispatching any execution agent.** The goal block is the intent anchor — it locks the destination while allowing flexible execution. For Level 5 tasks, tdd-guide scores all steps against the goal (0.0–1.0), reorders by priority, and auto-rewrites low-scoring steps before execution.
2. TDD    → tdd-guide agent: write tests FIRST, implement SECOND, refactor THIRD
3. REVIEW → code-reviewer agent immediately after code is written
4. SECURE → security-reviewer for auth/secrets/input/API changes (after code-reviewer)
5. DOCS   → doc-updater if docs changed (don't create new top-level files without asking)
6. COMMIT → Conventional commits format, comprehensive PR summaries
```

## ⚠️ P1: Layer Precedence (MANDATORY)

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

## ⚠️ P1: Review is MANDATORY (no exceptions)

```
AFTER ANY CODE CHANGE → code-reviewer
AFTER auth/secrets/input change → code-reviewer → security-reviewer
```

- Review happens **immediately** — not at the end of the day, not before commit, NOW
- CRITICAL and HIGH issues MUST be resolved before next phase
- Reviewer output is the final authority — don't argue, fix

## 📌 P2: Test-Driven Development (TDD)

1. **RED**: Write failing test first (tests MUST fail before implementation)
2. **GREEN**: Write minimal code to pass (don't over-engineer)
3. **REFACTOR**: Clean up while keeping tests green
4. **COVERAGE**: Verify 80%+ line and branch coverage

## 📌 P2: Commit & PR Rules

- Commit after each meaningful unit of work, not after the entire feature
- Format: `<type>: <description>` — feat, fix, refactor, docs, test, chore, perf, ci
- PR description must include: What, Why, How, Testing steps, Screenshots (if UI)
- Max 400 lines per PR — break large features into stacked PRs
