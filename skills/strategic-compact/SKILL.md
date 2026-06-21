---
name: strategic-compact
description: Strategic context compaction patterns covering what to preserve, what to discard, compaction timing, and state recovery. Use to manage agent context efficiently.
---

# Strategic Context Compaction

## When to Compact
- Approaching 80% context window
- After completing a major phase
- Before starting a new task
- When context has accumulated many tool outputs

## What to Preserve
- Current task description and goal
- Key decisions made and rationale
- Files created/modified with paths
- Remaining work items and status
- Active constraints and requirements
- Test results and coverage status
- Security concerns flagged

## What to Discard
- Verbose tool output (build logs, long diffs)
- Intermediate exploration results
- Redundant file listings
- Failed attempts that are resolved
- Conversation about unrelated topics

## Compaction Prompt
```
Preserve:
1. Current task status and progress
2. Key decisions made
3. Files created/modified
4. Remaining work items
5. Security concerns flagged

Discard:
- Verbose tool outputs
- Intermediate exploration
- Redundant file listings
```

## Post-Compaction
- Verify critical context survived
- Re-establish active task state
- Continue from checkpoint
