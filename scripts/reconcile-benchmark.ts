/**
 * Real reconciliation benchmark for ShadowLedger (no AWS required).
 *
 * Generates a corpus of order aggregates with a documented drift distribution,
 * then runs the ACTUAL production logic:
 *   - rebuildShadowState  (shared/state-machine)
 *   - detectDivergences   (services/divergence-detector/rules)
 *   - toRepairPlan        (services/repair-planner)
 *
 * and measures, from the running code:
 *   - drift detection rate    = drifted aggregates flagged / drifted aggregates
 *   - auto-repair rate         = findings repaired without human approval / findings
 *   - events replayed          = total ledger events reconstructed
 *
 * Some injected drift types (lost event, idempotency collision) have no rule yet,
 * so detection is intentionally below 100%. Numbers are not hardcoded.
 */
import { randomUUID } from "crypto";
import { rebuildShadowState } from "@shared/state-machine";
import { detectDivergences } from "../services/divergence-detector/rules";
import { toRepairPlan } from "../services/repair-planner/handler";
import { EventType, LedgerEvent, OrderState } from "@shared/events";
import * as fs from "fs";
import * as path from "path";

const SEED = 4242;
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type DriftKind =
  | "CLEAN"
  | "STUCK_AFTER_PAYMENT"
  | "INVENTORY_LEAK"
  | "MISSING_TERMINAL"
  | "DOUBLE_CAPTURE"
  | "DUPLICATE_SHIPMENT"
  | "OUT_OF_ORDER"
  | "LOST_EVENT" // no rule yet -> should be missed
  | "IDEMPOTENCY_COLLISION"; // no rule yet -> should be missed

// Realistic weighting: most orders are clean; low-risk operational drift is more
// common than the rare high-risk corruption; two classes are not yet covered.
const DISTRIBUTION: Array<[DriftKind, number]> = [
  ["CLEAN", 60],
  ["STUCK_AFTER_PAYMENT", 9],
  ["INVENTORY_LEAK", 8],
  ["MISSING_TERMINAL", 7],
  ["DOUBLE_CAPTURE", 4],
  ["DUPLICATE_SHIPMENT", 3],
  ["OUT_OF_ORDER", 3],
  ["LOST_EVENT", 4],
  ["IDEMPOTENCY_COLLISION", 2],
];

let seq = 0;
function evt(aggregateId: string, type: EventType, region = "us-east-1"): LedgerEvent {
  const ts = new Date(Date.UTC(2026, 0, 1) + seq++ * 1000).toISOString();
  return {
    event_id: randomUUID(),
    aggregate_id: aggregateId,
    aggregate_type: "ORDER",
    event_type: type,
    event_version: 1,
    event_timestamp: ts,
    correlation_id: aggregateId,
    causation_id: aggregateId,
    idempotency_key: `${aggregateId}-${type}`,
    region,
    service_name: "bench",
    payload: { customer_id: "c", total_amount: 100 },
    payload_hash: "h",
    trace_id: aggregateId,
    created_at: ts,
  };
}

interface Case {
  events: LedgerEvent[];
  actual: OrderState;
  drift: DriftKind;
}

function baseActual(id: string): OrderState {
  return {
    order_id: id,
    order_status: "PENDING",
    payment_status: "NONE",
    inventory_status: "NONE",
    fulfillment_status: "NONE",
    refund_status: "NONE",
    last_updated_at: new Date().toISOString(),
    version: 0,
    region: "us-east-1",
    customer_id: "c",
    total_amount: 100,
  };
}

function buildCase(drift: DriftKind): Case {
  const id = randomUUID();
  const e = (t: EventType) => evt(id, t);
  const actual = baseActual(id);

  switch (drift) {
    case "CLEAN": {
      const events = [
        e("ORDER_CREATED"), e("ORDER_VALIDATED"), e("PAYMENT_AUTHORIZED"),
        e("INVENTORY_RESERVED"), e("PAYMENT_CAPTURED"), e("FULFILLMENT_REQUESTED"),
        e("SHIPMENT_CREATED"), e("ORDER_COMPLETED"),
      ];
      return { events, actual: { ...actual, order_status: "COMPLETED", payment_status: "CAPTURED", inventory_status: "RESERVED", fulfillment_status: "SHIPPED" }, drift };
    }
    case "STUCK_AFTER_PAYMENT": {
      const events = [e("ORDER_CREATED"), e("ORDER_VALIDATED"), e("PAYMENT_AUTHORIZED"), e("INVENTORY_RESERVED"), e("PAYMENT_CAPTURED")];
      // production never advanced order_status past PENDING
      return { events, actual: { ...actual, payment_status: "CAPTURED", inventory_status: "RESERVED" }, drift };
    }
    case "INVENTORY_LEAK": {
      const events = [e("ORDER_CREATED"), e("INVENTORY_RESERVED"), e("ORDER_CANCELLED")];
      return { events, actual: { ...actual, order_status: "CANCELLED", inventory_status: "RESERVED" }, drift };
    }
    case "MISSING_TERMINAL": {
      const events = [e("ORDER_CREATED"), e("ORDER_VALIDATED"), e("PAYMENT_AUTHORIZED"), e("INVENTORY_RESERVED"), e("PAYMENT_CAPTURED")];
      return { events, actual: { ...actual, order_status: "PROCESSING", payment_status: "CAPTURED", inventory_status: "RESERVED" }, drift };
    }
    case "DOUBLE_CAPTURE": {
      const events = [e("ORDER_CREATED"), e("PAYMENT_AUTHORIZED"), e("PAYMENT_CAPTURED"), e("PAYMENT_CAPTURED")];
      return { events, actual: { ...actual, order_status: "PROCESSING", payment_status: "CAPTURED" }, drift };
    }
    case "DUPLICATE_SHIPMENT": {
      const events = [e("ORDER_CREATED"), e("FULFILLMENT_REQUESTED"), e("SHIPMENT_CREATED"), e("SHIPMENT_CREATED")];
      return { events, actual: { ...actual, order_status: "PROCESSING", fulfillment_status: "SHIPPED" }, drift };
    }
    case "OUT_OF_ORDER": {
      const events = [e("ORDER_CREATED"), e("SHIPMENT_CREATED"), e("FULFILLMENT_REQUESTED")];
      return { events, actual: { ...actual, order_status: "PROCESSING", fulfillment_status: "SHIPPED" }, drift };
    }
    case "LOST_EVENT": {
      // INVENTORY_RESERVED happened in production but its event never reached the ledger.
      const events = [e("ORDER_CREATED"), e("ORDER_VALIDATED"), e("PAYMENT_AUTHORIZED")];
      return { events, actual: { ...actual, order_status: "PROCESSING", payment_status: "AUTHORIZED", inventory_status: "RESERVED" }, drift };
    }
    case "IDEMPOTENCY_COLLISION": {
      const events = [e("ORDER_CREATED"), e("ORDER_VALIDATED")];
      return { events, actual: { ...actual, order_status: "PROCESSING" }, drift };
    }
  }
}

function pick(rng: () => number): DriftKind {
  const total = DISTRIBUTION.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [kind, w] of DISTRIBUTION) {
    if ((r -= w) <= 0) return kind;
  }
  return "CLEAN";
}

function main(): void {
  const rng = makeRng(SEED);
  const N = 1500;
  let driftedTotal = 0;
  let driftedDetected = 0;
  let findingsTotal = 0;
  let findingsAutoRepaired = 0;
  let eventsReplayed = 0;
  let falsePositives = 0;

  for (let i = 0; i < N; i++) {
    const drift = pick(rng);
    const { events, actual } = buildCase(drift);
    eventsReplayed += events.length;

    // Rebuilding the shadow can itself throw when the ledger is internally
    // inconsistent (e.g. two PAYMENT_CAPTURED events). That exception is a
    // detection signal: a HIGH-risk integrity violation that must be quarantined.
    let rebuildFailed = false;
    let findings: ReturnType<typeof detectDivergences> = [];
    try {
      const shadow = rebuildShadowState(actual.order_id, events);
      findings = detectDivergences(shadow, actual, events);
    } catch {
      rebuildFailed = true;
    }

    if (drift === "CLEAN") {
      if (rebuildFailed || findings.length > 0) falsePositives++;
      continue;
    }
    driftedTotal++;
    if (rebuildFailed || findings.length > 0) driftedDetected++;

    if (rebuildFailed) {
      // Ledger integrity violation: detected, but never auto-repaired.
      findingsTotal++;
      continue;
    }
    for (const f of findings) {
      findingsTotal++;
      const plan = toRepairPlan(f);
      if (!plan.requires_human_approval && plan.repair_type !== "QUARANTINE") {
        findingsAutoRepaired++;
      }
    }
  }

  const pct = (n: number, d: number) => (d === 0 ? 0 : (n / d) * 100);
  const summary = {
    config: { aggregates: N, seed: SEED },
    eventsReplayed,
    driftDetectionRate: `${pct(driftedDetected, driftedTotal).toFixed(1)}%`,
    autoRepairRate: `${pct(findingsAutoRepaired, findingsTotal).toFixed(1)}%`,
    falsePositiveRate: `${pct(falsePositives, N).toFixed(2)}%`,
    counts: { driftedTotal, driftedDetected, findingsTotal, findingsAutoRepaired, falsePositives },
  };

  const outDir = path.join(__dirname, "..", "benchmarks", "results");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "reconciliation-summary.json"), JSON.stringify(summary, null, 2));
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(summary, null, 2));
}

main();
