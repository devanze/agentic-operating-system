---
name: git-workflow
description: Git workflow patterns covering branching strategy, commit conventions, PR best practices, code review etiquette, and release management. Use when committing, creating PRs, or managing releases.
---

# Git Workflow

## Branching Strategy

### Main Branches
- `main` / `master` — Production-ready code, protected
- `develop` — Integration branch (optional for simpler projects)

### Feature Branches
```
feature/add-login        → develop → main
feature/payment-integration → develop → main
fix/user-profile-bug     → develop → main
```

### Naming Convention
- `feature/<description>` — New features
- `fix/<description>` — Bug fixes
- `refactor/<description>` — Code refactoring
- `docs/<description>` — Documentation
- `chore/<description>` — Maintenance, deps, config
- `hotfix/<description>` — Urgent production fixes (branch from main)

## Commit Convention

```
<type>: <description>

[optional body]
[optional footer]
```

### Types
- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code refactoring (no feature, no fix)
- `docs:` — Documentation only
- `test:` — Adding/fixing tests
- `chore:` — Maintenance, deps, build
- `perf:` — Performance improvement
- `ci:` — CI/CD changes

### Examples
```
feat: add password reset via email
fix: prevent duplicate order submissions
refactor: extract payment logic to service layer
docs: update API authentication guide
test: add edge case tests for date parser
```

## Pull Requests

### Before Creating PR
- [ ] All tests pass locally
- [ ] Code is self-reviewed
- [ ] No debug code or console.log
- [ ] Branch is up to date with base branch
- [ ] Changes are focused — one concern per PR

### PR Title
Same as commit convention: `feat: add password reset via email`

### PR Description
```markdown
## What
(What does this PR do? Brief summary.)

## Why
(Why is this needed? What problem does it solve?)

## How
(How was it implemented? Key decisions.)

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests passing
- [ ] Manual testing steps:
  1. Go to /login
  2. Click "Forgot Password"
  3. ...

## Screenshots (if UI)
(Before/after images)

## Checklist
- [ ] No breaking changes
- [ ] Security reviewed (auth, input validation, secrets)
- [ ] Performance considered
```

### PR Size
- Max 400 lines changed per PR (smaller is better)
- Break large features into stacked PRs
- Review time is proportional to PR size

## Code Review

### For Reviewers
- Review within 24 hours
- Be constructive, not critical
- Distinguish between "must fix" and "suggestion"
- Approve when satisfied, don't nitpick indefinitely

### For Authors
- Be responsive to feedback
- Don't take feedback personally
- Explain reasoning, don't argue
- Push follow-up commits, don't squash during review

## Release Process

1. Merge PRs to `main`
2. Tag version: `git tag v1.2.0`
3. Generate changelog
4. Deploy to production
5. Create GitHub release with notes
