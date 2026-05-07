import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { LedgerEvent } from "@shared/events";
import { fullJitterBackoffMs, structuredLog } from "@shared/observability";

const client = new SQSClient({});

export const routeEvent = async (event: LedgerEvent, queueUrl: string): Promise<void> => {
  await client.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(event),
      MessageAttributes: {
        event_type: { DataType: "String", StringValue: event.event_type },
      },
    }),
  );
};

export const handler = async (event: LedgerEvent): Promise<{ backoff_ms: number }> => {
  structuredLog("stream-router", "routing event to workflow queue", {
    event_id: event.event_id,
    event_type: event.event_type,
  });
  return { backoff_ms: fullJitterBackoffMs(1) };
};
