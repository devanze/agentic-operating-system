# Rule Priority Matrix

## ⛔ Priority Levels

| Level | Tag | Meaning | Consequence if violated |
|-------|-----|---------|------------------------|
| **P0 — CRITICAL** | `🚫` | Must NEVER be violated. No exceptions. | Task HALTED. Fix before continuing. |
| **P1 — MANDATORY** | `⚠️` | Must always be followed. Only skip with explicit user override. | BLOCKED — cannot proceed to next phase. |
| **P2 — STANDARD** | `📌` | Best practice, expected in all code. | WARNING — flagged in review, must be addressed. |
| **P3 — GUIDELINE** | `💡` | Recommended, use judgment. | NOTE — reviewer may suggest but not block. |

**Enforcement gates:** Pre-task check → In-task monitoring → Post-task verification → Review gate.
