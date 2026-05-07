# Replay Engine

Replay modes:
- `DRY_RUN`
- `SHADOW_REPLAY`
- `REPAIR_REPLAY`

Only `REPAIR_REPLAY` is allowed to mutate production state. Other modes rebuild and measure correctness without side effects.
