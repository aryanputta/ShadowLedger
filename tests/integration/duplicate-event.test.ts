import { detectDivergences } from "../../services/divergence-detector/rules";
import { LedgerEvent, OrderState, ShadowState } from "@shared/events";

test("duplicate payment capture becomes a high severity finding", () => {
  const shadow = {
    aggregate_id: "order-1",
    expected_order_status: "PROCESSING",
    expected_payment_status: "CAPTURED",
    expected_inventory_status: "RESERVED",
    expected_fulfillment_status: "REQUESTED",
    expected_refund_status: "NONE",
    rebuilt_from_event_count: 4,
    last_replayed_event_id: "4",
    last_rebuild_time: "2026-01-01T00:00:00.000Z",
    shadow_hash: "abc",
  } as ShadowState;
  const actual = {
    order_id: "order-1",
    order_status: "PROCESSING",
    payment_status: "CAPTURED",
    inventory_status: "RESERVED",
    fulfillment_status: "REQUESTED",
    refund_status: "NONE",
    last_updated_at: "2026-01-01T00:00:00.000Z",
    version: 1,
    region: "us-east-1",
    customer_id: "cust",
    total_amount: 10,
  } as OrderState;
  const events = [
    { event_type: "PAYMENT_CAPTURED" },
    { event_type: "PAYMENT_CAPTURED" },
  ] as LedgerEvent[];

  const findings = detectDivergences(shadow, actual, events);
  expect(findings.some((finding) => finding.finding_type === "DOUBLE_PAYMENT_CAPTURE")).toBe(true);
});
