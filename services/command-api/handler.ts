import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { randomUUID } from "crypto";
import { createOrderSchema } from "@shared/schemas";
import { hashJson, computeEventHash } from "@shared/hashing";
import { appendLedgerEvent } from "../event-ledger-writer/handler";
import { structuredLog } from "@shared/observability";

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const payload = createOrderSchema.parse(JSON.parse(event.body ?? "{}"));
  const orderId = randomUUID();
  const eventId = randomUUID();
  const payloadHash = hashJson(payload);

  await appendLedgerEvent({
    event_id: eventId,
    aggregate_id: orderId,
    aggregate_type: "ORDER",
    event_type: "ORDER_CREATED",
    event_version: 1,
    event_timestamp: new Date().toISOString(),
    correlation_id: event.requestContext.requestId,
    causation_id: event.requestContext.requestId,
    idempotency_key: payload.idempotency_key,
    region: payload.region,
    service_name: "command-api",
    payload,
    payload_hash: payloadHash,
    previous_event_hash: computeEventHash(payloadHash),
    trace_id: event.requestContext.requestId,
    created_at: new Date().toISOString(),
  });

  structuredLog("command-api", "created order command", {
    order_id: orderId,
    event_id: eventId,
  });

  return {
    statusCode: 201,
    body: JSON.stringify({ order_id: orderId, request_status: "ACCEPTED" }),
  };
};
