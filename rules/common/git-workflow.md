# Git Workflow (Universal)

## Branching Strategy

### Main Branches
- `main` / `master` — Production-ready code, protected (no direct pushes)
- `develop` — Integration branch for features (optional for simpler projects)

### Feature/Hotfix Branches
```bash
# Naming convention: <type>/<short-description>
git checkout -b feature/user-authentication
git checkout -b fix/login-error-handling
git checkout -b refactor/api-response-format
git checkout -b hotfix/security-vulnerability  # branches FROM main
```

| Prefix | Purpose | Branch From | Merge To |
|--------|---------|------------|----------|
| `feature/` | New feature or enhancement | `develop` or `main` | `develop` or `main` |
| `fix/` | Bug fix | `develop` or `main` | `develop` or `main` |
| `refactor/` | Code restructure (no behavior change) | `develop` | `develop` |
| `docs/` | Documentation only | `main` | `main` |
| `chore/` | Maintenance, deps, config | `develop` | `develop` |
| `hotfix/` | Urgent production fix | `main` | `main` + `develop` |

## Commit Convention

Format: `<type>: <description>`

```bash
# GOOD
git commit -m "feat: add password reset via email"
git commit -m "fix: prevent duplicate order submissions"
git commit -m "refactor: extract payment logic to service layer"
git commit -m "docs: update API authentication guide"
git commit -m "test: add edge case tests for date parser"
git commit -m "chore: upgrade typescript to 5.5"
git commit -m "perf: cache user permissions query"
git commit -m "ci: add dependency caching to build workflow"

# BAD
git commit -m "fix stuff"
git commit -m "wip"
git commit -m "changes"
git commit -m "fixed bug"
```

### Commit Body (for complex changes)

```bash
git commit -m "feat: add password reset flow

- Add POST /auth/forgot-password endpoint
- Add POST /auth/reset-password endpoint
- Send reset email via SendGrid with expiring token
- Rate limit to 1 request per 5 minutes per email

Closes #234"
```

## Pull Requests

### PR Checklist (Before Creating)
- [ ] All tests pass locally (`npm test` / `pytest` / etc.)
- [ ] Code is self-reviewed (read your own diff)
- [ ] No debug code, console.log, or TODO comments
- [ ] Branch is up to date with the base branch
- [ ] Commits are focused — one concern per PR (max ~400 lines changed)

### PR Template

```markdown
## What
<!-- Brief summary of changes. What does this PR do? -->

## Why
<!-- What problem does this solve? Why is this needed? -->

## How
<!-- How was it implemented? Key design decisions -->

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests passing
- [ ] Manual testing steps:
  1. Go to /settings
  2. Click "Delete account"
  3. Verify confirmation dialog appears

## Screenshots (if UI)
<!-- Before/after images -->

## Checklist
- [ ] No breaking changes
- [ ] Security reviewed (auth, input validation, secrets)
- [ ] Performance considered (queries, bundle size)
```

### PR Size Guidelines

| Size | Lines Changed | Review Time | Action |
|------|--------------|-------------|--------|
| Small | < 100 | Fast (5 min) | Good — ship it |
| Medium | 100-200 | Moderate (15 min) | OK — prefer smaller |
| Large | 200-400 | Slow (30 min) | Acceptable at upper limit |
| Too Large | 400+ | Very slow | Split into stacked PRs |

## Code Review Etiquette

### For Reviewers
- Review within **24 hours** (or same day for urgent fixes)
- Be constructive, not judgmental — ask questions, don't accuse
- Clearly distinguish: **"Must fix"** vs **"Suggestion"** vs **"Nitpick"**
- Approve when satisfied — don't let perfect be the enemy of good

### For Authors
- Be responsive to feedback — reply within the same business day
- Don't take feedback personally — code review is about the code, not you
- Explain your reasoning, but be open to alternatives
- Push follow-up commits, don't squash during review (squash on merge)

## Release Process

```bash
# 1. Create release branch
git checkout -b release/1.2.0 develop

# 2. Finalize changelog
# (generate from commits since last release)

# 3. Tag the version
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# 4. Merge to main
git checkout main
git merge --no-ff release/1.2.0
git push origin main

# 5. Back-merge to develop
git checkout develop
git merge --no-ff release/1.2.0
git push origin develop

# 6. Deploy from main
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `git push --force` on shared branches | `git push --force-with-lease` or new commits | force push rewrites history |
| Squashing during code review | Squash on merge | Reviewers can't see incremental changes |
| PRs with 50+ files changed | Stacked smaller PRs | Impossible to review thoroughly |
| Merging without CI passing | Branch protection requiring CI | CI catches regressions before merge |
