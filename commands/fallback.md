Trigger agent fallback and escalation for a failed agent call.

## Usage
/fallback <failed-agent> <task-id> <error-summary>

## Escalation Chains
- tdd-guide → build-error-resolver → planner
- build-error-resolver → planner → architect
- code-reviewer → security-reviewer (auto-trigger for sensitive code)
- any → general → planner → architect

## Behavior
1. Load original task context from task-id
2. Determine correct escalation target from chain
3. Re-dispatch with preserved context + error details
4. Report escalation path in result
5. Max 3 attempts per task unit

## Example
/fallback tdd-guide ses_abc123 "Compilation error: missing import in src/auth.ts"
→ Escalating to build-error-resolver...
