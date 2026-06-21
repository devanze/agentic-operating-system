---
name: autonomous-loops
description: Autonomous agent loop patterns covering goal definition, checkpointing, stall detection, iteration limits, and safe intervention. Use when running long autonomous tasks.
---

# Autonomous Loops

## Loop Setup
1. Define clear goal with measurable completion criteria
2. Set max iterations (default 50)
3. Set time limit (default 30 minutes)
4. Define checkpoint frequency (every 5 iterations)
5. Identify safe-to-automate operations

## Checkpointing
```
Checkpoint data:
- Current iteration number
- Files created/modified
- Test results so far
- Remaining work items
- Decisions made
```

## Stall Detection
- Same error repeating >3 times → stalled
- No file changes in 10 iterations → stalled
- Context growing without progress → stalled
- Token usage spike without output → stuck

## Safe Intervention
- Stalled: analyze cause, suggest new approach
- Looping: break cycle with explicit redirection
- Diverged: remind original goal, reset focus
- Error cascade: pause, fix root cause, resume

## Completion Check
- All exit conditions met
- Tests pass (if applicable)
- No remaining TODOs from the plan
- Deliverables match goal specification
