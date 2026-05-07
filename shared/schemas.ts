import { z } from "zod";
import { eventTypes } from "./events";

export const createOrderSchema = z.object({
  customer_id: z.string().min(1),
  total_amount: z.number().positive(),
  sku: z.string().min(1),
  quantity: z.number().int().positive(),
  idempotency_key: z.string().min(1),
  region: z.string().default("us-east-1"),
});

export const ledgerEventSchema = z.object({
  event_id: z.string(),
  aggregate_id: z.string(),
  aggregate_type: z.literal("ORDER"),
  event_type: z.enum(eventTypes),
  event_version: z.number().int().positive(),
  event_timestamp: z.string(),
  correlation_id: z.string(),
  causation_id: z.string(),
  idempotency_key: z.string(),
  region: z.string(),
  service_name: z.string(),
  payload: z.record(z.unknown()),
  payload_hash: z.string(),
  previous_event_hash: z.string().optional(),
  trace_id: z.string(),
  created_at: z.string(),
});
