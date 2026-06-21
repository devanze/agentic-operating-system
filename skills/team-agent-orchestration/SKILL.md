---
name: team-agent-orchestration
description: Multi-agent orchestration patterns covering parallel execution, agent coordination, result merging, and dependency management. Use when coordinating multiple agents.
---

# Team Agent Orchestration

## When to Use Multiple Agents
- Tasks with independent sub-tasks → parallel agents
- Multi-domain work (frontend + backend + DB) → specialized agents
- Review + implement loop → reviewer + implementer agents
- Complex debugging → explorer + resolver agents

## Coordination Patterns

### Parallel
```
Task: Build login feature
├── db-reviewer → Design users table
├── architect → Design auth flow
└── security-reviewer → Review auth approach
         ↓
    Merge results → Planner creates implementation plan
```

### Sequential
```
Code Explorer → maps codebase
       ↓
Planner → creates plan
       ↓
TDD Guide → tests + implementation
       ↓
Code Reviewer → reviews changes
       ↓
Security Reviewer → audits security
```

### Review Loop
```
Implementer → writes code
     ↓
Reviewer → finds issues
     ↓
Implementer → fixes issues
     ↓  (repeat until approved)
Reviewer → approves
```

## Best Practices
- Launch independent agents in parallel
- One agent per domain/concern
- Clear handoff data between agents
- Merge results before next phase
- Track which agent did what
