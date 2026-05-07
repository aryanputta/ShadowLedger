import { DivergenceFinding, LedgerEvent, OrderState, ShadowState } from "@shared/events";
import { randomUUID } from "crypto";

const finding = (
  aggregateId: string,
  findingType: DivergenceFinding["finding_type"],
  severity: DivergenceFinding["severity"],
  expected: DivergenceFinding["expected_state"],
  actual: DivergenceFinding["actual_state"],
  rootCause: string,
  repairStrategy: string,
  riskLevel: DivergenceFinding["risk_level"],
  requiresHumanApproval: boolean,
): DivergenceFinding => ({
  finding_id: randomUUID(),
  finding_type: findingType,
  severity,
  aggregate_id: aggregateId,
  expected_state: expected,
  actual_state: actual,
  root_cause_guess: rootCause,
  repair_strategy: repairStrategy,
  risk_level: riskLevel,
  requires_human_approval: requiresHumanApproval,
  created_at: new Date().toISOString(),
  status: "OPEN",
});

export const detectDivergences = (
  shadow: ShadowState,
  actual: OrderState,
  events: LedgerEvent[],
): DivergenceFinding[] => {
  const findings: DivergenceFinding[] = [];
  const captureCount = events.filter((event) => event.event_type === "PAYMENT_CAPTURED").length;
  const shipmentCount = events.filter((event) => event.event_type === "SHIPMENT_CREATED").length;

  if (
    ["AUTHORIZED", "CAPTURED"].includes(actual.payment_status) &&
    actual.order_status === "PENDING"
  ) {
    findings.push(
      finding(
        actual.order_id,
        "ORDER_STUCK_AFTER_PAYMENT",
        "MEDIUM",
        shadow,
        actual,
        "forward progress stopped after payment success",
        "replay fulfillment request if inventory is reserved",
        "LOW",
        false,
      ),
    );
  }

  if (
    actual.inventory_status === "RESERVED" &&
    ["CANCELLED"].includes(actual.order_status)
  ) {
    findings.push(
      finding(
        actual.order_id,
        "INVENTORY_LEAK",
        "HIGH",
        shadow,
        actual,
        "inventory remained reserved after terminal cancellation",
        "release inventory",
        "LOW",
        false,
      ),
    );
  }

  if (captureCount > 1) {
    findings.push(
      finding(
        actual.order_id,
        "DOUBLE_PAYMENT_CAPTURE",
        "HIGH",
        shadow,
        actual,
        "more than one payment capture event exists",
        "quarantine order and require approval",
        "HIGH",
        true,
      ),
    );
  }

  if (shipmentCount > 1) {
    findings.push(
      finding(
        actual.order_id,
        "DUPLICATE_SHIPMENT",
        "HIGH",
        shadow,
        actual,
        "more than one shipment created event exists",
        "quarantine order and require approval",
        "HIGH",
        true,
      ),
    );
  }

  const fulfillmentIdx = events.findIndex((event) => event.event_type === "FULFILLMENT_REQUESTED");
  const shipmentIdx = events.findIndex((event) => event.event_type === "SHIPMENT_CREATED");
  if (shipmentIdx !== -1 && (fulfillmentIdx === -1 || shipmentIdx < fulfillmentIdx)) {
    findings.push(
      finding(
        actual.order_id,
        "OUT_OF_ORDER_WORKFLOW",
        "HIGH",
        shadow,
        actual,
        "shipment appeared before fulfillment request",
        "quarantine order",
        "HIGH",
        true,
      ),
    );
  }

  if (
    actual.payment_status === "CAPTURED" &&
    actual.inventory_status === "RESERVED" &&
    !["COMPLETED", "CANCELLED", "QUARANTINED"].includes(actual.order_status)
  ) {
    findings.push(
      finding(
        actual.order_id,
        "MISSING_TERMINAL_STATE",
        "MEDIUM",
        shadow,
        actual,
        "workflow reached success prerequisites without terminal state",
        "replay finalization step",
        "LOW",
        false,
      ),
    );
  }

  return findings;
};
