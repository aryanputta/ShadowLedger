# Architecture

ShadowLedger separates workflow execution from workflow correctness.

- The execution path writes immutable events and advances forward progress.
- The correctness path rebuilds expected state from the event ledger and validates that production state matches.
- The repair path only executes replay-safe actions automatically.
