# Core Principles

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
