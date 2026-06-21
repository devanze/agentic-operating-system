Save current session state as a named checkpoint.

Writes current task state atomically (tmp→rename, schema validated). Records task_id, phase, status, cycle, severity, artifacts, state_version. Provides recovery point for resuming.