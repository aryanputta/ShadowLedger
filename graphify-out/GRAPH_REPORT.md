# Graph Report - .  (2026-05-07)

## Corpus Check
- 47 files · ~4,375 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 87 nodes · 71 edges · 34 communities detected
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]

## God Nodes (most connected - your core abstractions)
1. `handler()` - 22 edges
2. `hashJson()` - 5 edges
3. `rebuildShadowState()` - 4 edges
4. `appendLedgerEvent()` - 4 edges
5. `mk()` - 3 edges
6. `computeEventHash()` - 3 edges
7. `structuredLog()` - 3 edges
8. `buildShadowForAggregate()` - 3 edges
9. `detectDivergences()` - 3 edges
10. `replayEvents()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `handler()` --calls--> `fullJitterBackoffMs()`  [INFERRED]
  services/inventory-service/handler.ts → shared/observability.ts
- `handler()` --calls--> `hashJson()`  [INFERRED]
  services/inventory-service/handler.ts → shared/hashing.ts
- `handler()` --calls--> `computeEventHash()`  [INFERRED]
  services/inventory-service/handler.ts → shared/hashing.ts
- `replayEvents()` --calls--> `rebuildShadowState()`  [INFERRED]
  services/replay-worker/handler.ts → shared/state-machine.ts
- `handler()` --calls--> `structuredLog()`  [INFERRED]
  services/inventory-service/handler.ts → shared/observability.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (4): executeRepair(), handler(), replayEvents(), toRepairPlan()

### Community 1 - "Community 1"
Cohesion: 0.29
Nodes (4): computeEventHash(), hashJson(), LambdaStack, mk()

### Community 2 - "Community 2"
Cohesion: 0.25
Nodes (4): appendLedgerEvent(), assertNoIdempotencyCollision(), fullJitterBackoffMs(), structuredLog()

### Community 3 - "Community 3"
Cohesion: 0.33
Nodes (5): ConflictError, IdempotencyCollisionError, InvalidStateTransitionError, UnsafeRepairError, ValidationError

### Community 4 - "Community 4"
Cohesion: 0.4
Nodes (4): buildShadowForAggregate(), applyEventToOrderState(), assert(), rebuildShadowState()

### Community 5 - "Community 5"
Cohesion: 0.67
Nodes (1): DynamoDbStack

### Community 6 - "Community 6"
Cohesion: 0.67
Nodes (1): ShadowLedgerStack

### Community 7 - "Community 7"
Cohesion: 0.67
Nodes (1): WorkflowStack

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (1): ObservabilityStack

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (1): ApiStack

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (2): detectDivergences(), finding()

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **5 isolated node(s):** `ValidationError`, `ConflictError`, `IdempotencyCollisionError`, `InvalidStateTransitionError`, `UnsafeRepairError`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 12`** (1 nodes): `app.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `duplicate-event.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `schemas.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `events.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `dynamodb.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `rebuild-shadow-state.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `run-repair-cycle.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `cleanup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `seed-events.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `export-events-to-s3.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `seed-inventory.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `inject-missing-event.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `inject-inventory-race.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `inject-lambda-timeout.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `inject-out-of-order-event.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `inject-region-conflict.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `inject-duplicate-event.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `k6-replay-test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `k6-duplicate-checkout.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `k6-chaos-recovery-test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `k6-create-orders.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `repair-planner.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `handler()` connect `Community 0` to `Community 1`, `Community 2`, `Community 4`, `Community 10`, `Community 11`?**
  _High betweenness centrality (0.213) - this node is a cross-community bridge._
- **Why does `hashJson()` connect `Community 1` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `handler()` (e.g. with `structuredLog()` and `fullJitterBackoffMs()`) actually correct?**
  _`handler()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `hashJson()` (e.g. with `mk()` and `rebuildShadowState()`) actually correct?**
  _`hashJson()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `rebuildShadowState()` (e.g. with `hashJson()` and `buildShadowForAggregate()`) actually correct?**
  _`rebuildShadowState()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `appendLedgerEvent()` (e.g. with `assertNoIdempotencyCollision()` and `structuredLog()`) actually correct?**
  _`appendLedgerEvent()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `mk()` (e.g. with `.constructor()` and `hashJson()`) actually correct?**
  _`mk()` has 2 INFERRED edges - model-reasoned connections that need verification._