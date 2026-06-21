---
name: prompt-engineering
description: Prompt engineering guide for AI agents — structuring instructions, effective delegation, context management, and communication patterns. Use when writing prompts for AI coding assistants.
---

# Prompt Engineering

## Writing Effective Prompts

### Be Specific
```
BAD:  "Fix the bug"
GOOD: "The login endpoint returns 500 when email contains '+' character.
       Fix the email validation to allow RFC 5322 compliant addresses."
```

### Provide Context
```
GOOD: "We're building an inventory management system. The StockLevel
       component shows warehouse stock. Add a low-stock warning banner
       when quantity < reorderPoint. The banner should be yellow for
       warning and red for critical (< 50% of reorderPoint)."
```

### Specify Output Format
```
GOOD: "Create a new service file with:
       1. TypeScript interface for the config
       2. Class with constructor taking the interface
       3. Method: async fetchData(): Promise<Data[]>
       4. Error handling with specific error types
       5. Unit tests following AAA pattern"
```

## Agent Delegation

### When to Use Agents
- **Complex multi-step tasks** → planner agent
- **Code written/modified** → code-reviewer agent
- **New feature / bug fix** → tdd-guide agent
- **Architecture decisions** → architect agent
- **Security-sensitive code** → security-reviewer

### Good Delegation
```
GOOD: "Review the auth module for security issues and provide fixes"
GOOD: "Create a test suite for the payment service with 80%+ coverage"
GOOD: "Design the database schema for a multi-tenant blog platform"
```

### Bad Delegation
```
BAD: "Make it better" (too vague)
BAD: "Rewrite everything" (too broad)
BAD: "Do something about the code" (no direction)
```

## Context Management

### What to Include
- Project description and tech stack
- Relevant file paths and code snippets
- Error messages and stack traces
- Existing patterns and conventions
- Constraints and requirements

### What to Exclude
- Irrelevant files and code
- Long git logs or terminal output
- Unrelated conversation history
- Multiple versions of the same code

### When Context is Limited
- Focus on one task at a time
- Reference files by path instead of copying content
- Summarize past decisions instead of including full history
- Use agents for isolated subtasks to keep context clean

## Communication Patterns

### Do
- State what you want clearly and directly
- Provide examples of expected behavior
- Include error messages when things go wrong
- Ask "how would you approach this?" for planning
- Confirm understanding before implementation

### Don't
- Use ambiguous language ("make it work better")
- Assume the agent knows project conventions
- Give contradictory instructions
- Ask for too many things in one prompt
- Change requirements mid-task without context

## Iteration

```
Start small → Review → Refine → Expand
```

1. Start with a minimal working version
2. Review the output carefully
3. Give specific feedback on what to change
4. Build on working code incrementally
5. Don't try to perfect everything in one prompt

## Safety

- Never paste secrets, API keys, or tokens in prompts
- Review agent-generated code before committing
- Verify security-sensitive changes manually
- Use read-only agents for review tasks
- Trust but verify — agents can make mistakes
