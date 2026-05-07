import { rebuildShadowState } from "@shared/state-machine";
import { hashJson } from "@shared/hashing";
import { LedgerEvent } from "@shared/events";

test("successful event sequence yields completed shadow status", () => {
  const base = {
    aggregate_id: "order-1",
    aggregate_type: "ORDER" as const,
    event_version: 1,
    event_timestamp: "2026-01-01T00:00:00.000Z",
    correlation_id: "c1",
    causation_id: "c1",
    idempotency_key: "idem-1",
    region: "us-east-1",
    service_name: "test",
    trace_id: "t1",
    created_at: "2026-01-01T00:00:00.000Z",
  };
  const mk = (event_id: string, event_type: LedgerEvent["event_type"], payload = {}) =>
    ({
      ...base,
      event_id,
      event_type,
      payload,
      payload_hash: hashJson(payload),
    }) as LedgerEvent;

  const shadow = rebuildShadowState("order-1", [
    mk("1", "ORDER_CREATED", { customer_id: "cust", total_amount: 10 }),
    mk("2", "ORDER_VALIDATED"),
    mk("3", "PAYMENT_AUTHORIZED"),
    mk("4", "INVENTORY_RESERVED"),
    mk("5", "FULFILLMENT_REQUESTED"),
    mk("6", "SHIPMENT_CREATED"),
    mk("7", "PAYMENT_CAPTURED"),
    mk("8", "ORDER_COMPLETED"),
  ]);

  expect(shadow.expected_order_status).toBe("COMPLETED");
  expect(shadow.expected_payment_status).toBe("CAPTURED");
  expect(shadow.expected_inventory_status).toBe("RESERVED");
});
