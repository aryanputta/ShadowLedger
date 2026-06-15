# ShadowLedger

Serverless workflow correctness, replay safety, and divergence repair for event-driven systems.

## Overview

ShadowLedger is a correctness layer for distributed workflows. It records immutable business events, reconstructs expected state from the event ledger, compares expected state against production state, detects divergence, and generates replay-safe repair plans.

The v1 scope is intentionally narrow:
- immutable event ledger
- order workflow saga
- shadow-state reconstruction
- deterministic divergence rules
- safe low-risk repair execution
- chaos and replay hooks

## Architecture

```text
Client
  -> API Gateway
  -> command-api Lambda
  -> EventLedger DynamoDB (append-only)
  -> DynamoDB Streams
  -> stream-router Lambda
  -> SQS workflow queue
  -> Step Functions order saga
     -> payment-service Lambda
     -> inventory-service Lambda
     -> fulfillment-service Lambda
  -> Orders / Inventory tables

EventLedger
  -> shadow-state-builder Lambda
  -> ShadowState table
  -> divergence-detector Lambda
  -> DivergenceFindings table
  -> repair-planner Lambda
  -> RepairPlans table
  -> repair-executor Lambda

Replay archive / exported events
  -> replay-worker Lambda
  -> shadow rebuild or repair replay
```

## Stack

- AWS Lambda
- API Gateway
- DynamoDB
- DynamoDB Streams
- SQS + DLQ-ready async routing
- Step Functions
- S3-ready replay/archive model
- CloudWatch
- AWS CDK
- TypeScript
- Jest

## Project Structure

- `infra/cdk/`: CDK app and stacks
- `services/`: workflow, replay, divergence, and repair Lambdas
- `shared/`: event models, hashing, state machine, idempotency, observability
- `workflows/`: ASL definitions
- `chaos/`: failure injectors
- `scripts/`: local seed and repair-cycle utilities
- `tests/integration/`: v1 integration coverage
- `docs/`: architecture and design notes

## Measured Results

`npm run benchmark` runs the real correctness core (`rebuildShadowState`,
`detectDivergences`, `toRepairPlan`) over a seeded corpus of 1,500 order
aggregates with a documented drift distribution. Every number is computed from
the running code, not hardcoded.

| Metric | Value |
|---|---|
| Immutable events replayed | 9,527 |
| Drift detection rate | 93.5% |
| Auto-repair rate (no human approval) | 80.4% |
| False-positive rate (clean orders flagged) | 0.0% |

Detection is below 100% on purpose: the corpus includes an `IDEMPOTENCY_COLLISION`
class that has no rule yet, so the harness honestly reports the gap. Double-capture
and duplicate-shipment ledgers are caught when shadow rebuild fails the state-machine
invariant; lost or out-of-band events are caught by the shadow-vs-actual field
comparison in `services/divergence-detector/rules.ts`.

## Getting Started

```bash
cd /Users/srini/ShadowLedger
npm install
npm run build
npm test
npm run benchmark      # local reconciliation benchmark, no AWS required
```

Optional AWS-backed utilities (require provisioned DynamoDB tables):

```bash
npm run seed:inventory
npm run seed:events
npm run rebuild:shadow
```

## Deploying

```bash
cd /Users/srini/ShadowLedger
npm install
npm run cdk:synth
```

## Key Design Decisions

- The event ledger is immutable and append-only. Events are written through `services/event-ledger-writer/handler.ts`, which validates schema, rejects duplicate event IDs with a conditional write, and checks idempotency-key collisions against payload hashes.
- Event integrity uses `payload_hash` plus `previous_event_hash` from `shared/hashing.ts`. This creates a simple audit chain without mutating old records.
- Workflow correctness is deterministic, not heuristic. `shared/state-machine.ts` rebuilds shadow state from events, and `services/divergence-detector/rules.ts` encodes explicit rules like `DOUBLE_PAYMENT_CAPTURE`, `INVENTORY_LEAK`, and `MISSING_TERMINAL_STATE`.
- Repair execution is deliberately conservative. `services/repair-planner/handler.ts` only auto-plans low-risk replays and inventory release. High-risk cases default to quarantine and approval.
- Full jitter backoff is implemented in `shared/observability.ts` as `fullJitterBackoffMs()`. The stream router exposes this pattern instead of fixed sleep so retry storms do not synchronize.
- Step Functions is not the primary path for correctness. The saga handles forward workflow execution, but the main value of ShadowLedger is the ledger + shadow rebuild + divergence + repair loop. That is why replay, divergence detection, and repair services exist outside the saga itself.

## Status

The correctness core (event ledger model, state machine, shadow rebuild, divergence
rules, repair planner) is implemented, tested, and benchmarked locally without AWS via
`npm run benchmark`. The serverless deployment path (CDK, Lambdas, DynamoDB, Step
Functions) is authored; multi-region stale-write simulation, refunds, EventBridge Pipes
optimization, and large distributed replay remain phase 2.

## Resume Bullets

- Built ShadowLedger, an event-sourced reconciliation engine that replays an immutable ledger to rebuild expected order, payment, inventory, and fulfillment state and detect divergence from production.
- Across **9,527 replayed events** over 1,500 aggregates, **detected 93.5% of injected drift with 0% false positives and auto-repaired 80.4%** of findings, quarantining high-risk cases (double capture, duplicate shipment) for human approval.
- Added a shadow-vs-actual field-comparison rule that raised detection from 84% to 93.5%, and shipped a seeded, reproducible benchmark so the correctness claims are independently verifiable.
