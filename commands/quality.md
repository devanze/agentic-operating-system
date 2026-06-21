Run the quality gate on the current codebase:

- Lint check (eslint, pylint, golangci-lint)
- Format check (prettier, black, gofmt)
- Type check (tsc, mypy, etc.)
- Test suite execution
- Security audit (dependency scan)

Report all failures with specific file:line references. Fix critical issues before proceeding.
