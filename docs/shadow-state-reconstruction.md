# Shadow State Reconstruction

The shadow builder reads all events for one aggregate and applies deterministic state transitions to rebuild expected workflow state. The rebuilt state is written to `ShadowState` with a `shadow_hash` and event-count metadata.
