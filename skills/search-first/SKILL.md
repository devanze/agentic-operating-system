---
name: search-first
description: Search-first development pattern — search for existing solutions, documentation, and patterns before writing new code. Use at the start of any development task.
---

# Search-First Development

## Why Search First
- Avoid reinventing the wheel
- Find existing solutions and patterns
- Understand library APIs before using them
- Discover project conventions
- Prevent duplicate implementations

## Search Strategy

### 1. Search Codebase
```
- glob: find files by pattern
- grep: search file contents
- Find similar implementations
- Find existing utilities and helpers
```

### 2. Search Documentation
```
- Context7 MCP: library docs, API references
- Exa Search: web research
- Project docs: README, /docs, ARCHITECTURE
```

### 3. Search Conventions
```
- How does this project handle errors?
- What's the testing pattern?
- How are modules organized?
- What's the naming convention?
```

## When Applied
- Before creating new components → check if one exists
- Before writing utilities → check if already implemented
- Before choosing a library → check what's already used
- Before designing API → check existing API patterns
- Before fixing a bug → search for similar issues
