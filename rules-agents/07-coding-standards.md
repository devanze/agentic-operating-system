# Coding Standards & Practices

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
