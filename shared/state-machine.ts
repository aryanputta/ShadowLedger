import { InvalidStateTransitionError } from "./errors";
import { LedgerEvent, OrderState, ShadowState } from "./events";
import { hashJson } from "./hashing";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new InvalidStateTransitionError(message);
  }
};

export const applyEventToOrderState = (
  state: OrderState,
  event: LedgerEvent,
): OrderState => {
  const next = { ...state, last_event_id: event.event_id, last_updated_at: event.event_timestamp, version: state.version + 1 };

  switch (event.event_type) {
    case "ORDER_CREATED":
      return { ...next, order_status: "PENDING" };
    case "ORDER_VALIDATED":
      return { ...next, order_status: "PROCESSING" };
    case "PAYMENT_AUTHORIZED":
      return { ...next, payment_status: "AUTHORIZED" };
    case "PAYMENT_CAPTURED":
      assert(state.payment_status !== "CAPTURED", "double payment capture");
      return { ...next, payment_status: "CAPTURED" };
    case "PAYMENT_FAILED":
      return { ...next, payment_status: "FAILED", order_status: "CANCELLED" };
    case "INVENTORY_RESERVED":
      return { ...next, inventory_status: "RESERVED" };
    case "INVENTORY_RELEASED":
      return { ...next, inventory_status: "RELEASED", order_status: "CANCELLED" };
    case "INVENTORY_RESERVATION_FAILED":
      return { ...next, inventory_status: "FAILED", order_status: "CANCELLED" };
    case "FULFILLMENT_REQUESTED":
      return { ...next, fulfillment_status: "REQUESTED" };
    case "SHIPMENT_CREATED":
      assert(state.fulfillment_status !== "SHIPPED", "duplicate shipment");
      return { ...next, fulfillment_status: "SHIPPED" };
    case "SHIPMENT_FAILED":
      return { ...next, fulfillment_status: "FAILED", order_status: "QUARANTINED" };
    case "ORDER_CANCELLED":
      return { ...next, order_status: "CANCELLED" };
    case "ORDER_COMPLETED":
      return { ...next, order_status: "COMPLETED" };
    case "ORDER_QUARANTINED":
      return { ...next, order_status: "QUARANTINED" };
    default:
      return next;
  }
};

export const rebuildShadowState = (
  aggregateId: string,
  events: LedgerEvent[],
): ShadowState => {
  const base: OrderState = {
    order_id: aggregateId,
    order_status: "PENDING",
    payment_status: "NONE",
    inventory_status: "NONE",
    fulfillment_status: "NONE",
    refund_status: "NONE",
    last_updated_at: events[0]?.created_at ?? new Date().toISOString(),
    version: 0,
    region: events[0]?.region ?? "us-east-1",
    customer_id: String(events[0]?.payload.customer_id ?? "unknown"),
    total_amount: Number(events[0]?.payload.total_amount ?? 0),
  };

  const state = events.reduce(applyEventToOrderState, base);

  return {
    aggregate_id: aggregateId,
    expected_order_status: state.order_status,
    expected_payment_status: state.payment_status,
    expected_inventory_status: state.inventory_status,
    expected_fulfillment_status: state.fulfillment_status,
    expected_refund_status: state.refund_status,
    rebuilt_from_event_count: events.length,
    last_replayed_event_id: events.at(-1)?.event_id,
    last_rebuild_time: new Date().toISOString(),
    shadow_hash: hashJson(state),
  };
};
