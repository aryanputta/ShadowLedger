export const eventTypes = [
  "ORDER_CREATED",
  "ORDER_VALIDATED",
  "PAYMENT_AUTHORIZED",
  "PAYMENT_CAPTURED",
  "PAYMENT_FAILED",
  "INVENTORY_RESERVED",
  "INVENTORY_RELEASED",
  "INVENTORY_RESERVATION_FAILED",
  "FULFILLMENT_REQUESTED",
  "SHIPMENT_CREATED",
  "SHIPMENT_FAILED",
  "ORDER_CANCELLED",
  "ORDER_COMPLETED",
  "ORDER_QUARANTINED",
  "REPAIR_PLAN_CREATED",
  "REPAIR_EXECUTED"
] as const;

export type EventType = (typeof eventTypes)[number];

export interface LedgerEvent {
  event_id: string;
  aggregate_id: string;
  aggregate_type: "ORDER";
  event_type: EventType;
  event_version: number;
  event_timestamp: string;
  correlation_id: string;
  causation_id: string;
  idempotency_key: string;
  region: string;
  service_name: string;
  payload: Record<string, unknown>;
  payload_hash: string;
  previous_event_hash?: string;
  trace_id: string;
  created_at: string;
}

export interface OrderState {
  order_id: string;
  order_status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "QUARANTINED";
  payment_status: "NONE" | "AUTHORIZED" | "CAPTURED" | "FAILED";
  inventory_status: "NONE" | "RESERVED" | "RELEASED" | "FAILED";
  fulfillment_status: "NONE" | "REQUESTED" | "SHIPPED" | "FAILED";
  refund_status: "NONE";
  last_event_id?: string;
  last_updated_at: string;
  version: number;
  region: string;
  customer_id: string;
  total_amount: number;
}

export interface InventoryState {
  sku: string;
  available_quantity: number;
  reserved_quantity: number;
  last_updated_at: string;
  version: number;
}

export interface ShadowState {
  aggregate_id: string;
  expected_order_status: OrderState["order_status"];
  expected_payment_status: OrderState["payment_status"];
  expected_inventory_status: OrderState["inventory_status"];
  expected_fulfillment_status: OrderState["fulfillment_status"];
  expected_refund_status: OrderState["refund_status"];
  rebuilt_from_event_count: number;
  last_replayed_event_id?: string;
  last_rebuild_time: string;
  shadow_hash: string;
}

export interface DivergenceFinding {
  finding_id: string;
  finding_type:
    | "ORDER_STUCK_AFTER_PAYMENT"
    | "INVENTORY_LEAK"
    | "DOUBLE_PAYMENT_CAPTURE"
    | "DUPLICATE_SHIPMENT"
    | "OUT_OF_ORDER_WORKFLOW"
    | "MISSING_TERMINAL_STATE"
    | "STATE_FIELD_DIVERGENCE"
    | "IDEMPOTENCY_COLLISION";
  severity: "LOW" | "MEDIUM" | "HIGH";
  aggregate_id: string;
  expected_state: unknown;
  actual_state: unknown;
  root_cause_guess: string;
  repair_strategy: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  requires_human_approval: boolean;
  created_at: string;
  resolved_at?: string;
  status: "OPEN" | "PLANNED" | "RESOLVED" | "QUARANTINED";
}

export interface RepairPlan {
  repair_plan_id: string;
  finding_id: string;
  aggregate_id: string;
  repair_type: "REPLAY_EVENT" | "RELEASE_INVENTORY" | "FINALIZE_ORDER" | "QUARANTINE";
  repair_steps: string[];
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  requires_human_approval: boolean;
  approval_status: "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";
  execution_status: "CREATED" | "EXECUTED" | "SKIPPED";
  created_at: string;
  executed_at?: string;
}
