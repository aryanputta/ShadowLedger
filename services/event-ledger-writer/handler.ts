import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ledgerEventSchema } from "@shared/schemas";
import { assertNoIdempotencyCollision } from "@shared/idempotency";
import { structuredLog } from "@shared/observability";
import { tableNames } from "@shared/dynamodb";
import { ValidationError } from "@shared/errors";
import { LedgerEvent } from "@shared/events";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const appendLedgerEvent = async (event: LedgerEvent): Promise<void> => {
  const parsed = ledgerEventSchema.safeParse(event);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.message);
  }

  const existing = await client.send(
    new QueryCommand({
      TableName: tableNames.eventLedger,
      KeyConditionExpression: "aggregate_id = :aggregate_id",
      ExpressionAttributeValues: {
        ":aggregate_id": event.aggregate_id,
      },
      ScanIndexForward: false,
      Limit: 1,
    }),
  );

  const latest = existing.Items?.[0] as LedgerEvent | undefined;
  assertNoIdempotencyCollision(latest, event.idempotency_key, event.payload_hash);

  await client.send(
    new PutCommand({
      TableName: tableNames.eventLedger,
      Item: {
        ...event,
        aggregate_id: event.aggregate_id,
        sort_key: `${event.event_timestamp}#${event.event_id}`,
      },
      ConditionExpression: "attribute_not_exists(event_id)",
    }),
  );

  structuredLog("event-ledger-writer", "appended immutable event", {
    aggregate_id: event.aggregate_id,
    event_id: event.event_id,
    event_type: event.event_type,
  });
};

export const handler = async (event: LedgerEvent): Promise<{ status: string }> => {
  await appendLedgerEvent(event);
  return { status: "OK" };
};
