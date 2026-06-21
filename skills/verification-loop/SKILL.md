---
name: verification-loop
description: Verification loop pattern for validating code changes — tests pass, lint clean, typecheck succeeds, security approved, behavior verified. Use after making code changes.
---

# Verification Loop

## Verify After Every Change

### 1. Run Tests
```
npm test / pytest / go test / cargo test
→ All tests must pass
→ Coverage must be ≥80%
```

### 2. Check Types
```
tsc --noEmit / mypy / go vet
→ Zero type errors
→ No implicit any
```

### 3. Lint
```
eslint / ruff / golangci-lint
→ Zero lint errors
→ Consistent code style
```

### 4. Format
```
prettier --check / black --check / gofmt -l
→ All files properly formatted
→ No unstaged formatting changes
```

### 5. Security Check
```
npm audit / pip-audit / cargo audit
→ No critical vulnerabilities
→ No hardcoded secrets
→ No injection vectors
```

### 6. Behavior Verification
```
- Does it do what was asked?
- Are edge cases handled?
- Do existing features still work?
- Is the UX acceptable?
```

## Verification Gate
```
All checks above pass → Proceed
Any check fails → Fix → Re-verify
```

## Automation
Set up pre-commit hooks for: lint, format, test, typecheck
