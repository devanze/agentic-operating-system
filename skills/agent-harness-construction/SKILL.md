---
name: agent-harness-construction
description: Patterns for building AI agent harnesses covering agent definition, tool binding, hook systems, model routing, and session management. Use when building or extending agent systems.
---

# Agent Harness Construction

## Agent Definition
- Clear role description with domain scope
- Explicit model assignment per capability need
- Tool permissions: least privilege
- Temperature settings: 0.0-0.15 for precision, 0.15-0.3 for creative
- Mode: primary vs subagent

## Tool Binding
- Custom tools for domain-specific operations
- MCP servers for external integration
- File system tools: read, write, edit, glob, grep
- Shell tools: bash with permission controls
- Tools should have clear descriptions and parameter schemas

## Hook System
- Pre-execution: validation, security checks, reminders
- Post-execution: analysis, formatting, notifications
- Session lifecycle: start, idle, end, compact
- Environment injection: package manager, language detection
- Permission hooks: auto-approve safe operations

## Model Routing
- Heavy models for reasoning, planning, review
- Light models for execution, formatting, simple tasks
- Model routing by agent capability
- Cost optimization through model selection

## Session Management
- Context compaction strategies
- State preservation across compaction
- Progress checkpointing
- Session continuity hooks
