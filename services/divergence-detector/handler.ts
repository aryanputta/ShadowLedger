import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { tableNames } from "@shared/dynamodb";
import { DivergenceFinding, LedgerEvent, OrderState, ShadowState } from "@shared/events";
import { detectDivergences } from "./rules";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: { aggregate_id: string }): Promise<DivergenceFinding[]> => {
  const [shadowResponse, actualResponse, eventResponse] = await Promise.all([
    client.send(new GetCommand({ TableName: tableNames.shadowState, Key: { aggregate_id: event.aggregate_id } })),
    client.send(new GetCommand({ TableName: tableNames.orders, Key: { order_id: event.aggregate_id } })),
    client.send(
      new QueryCommand({
        TableName: tableNames.eventLedger,
        KeyConditionExpression: "aggregate_id = :aggregate_id",
        ExpressionAttributeValues: { ":aggregate_id": event.aggregate_id },
      }),
    ),
  ]);

  const findings = detectDivergences(
    shadowResponse.Item as ShadowState,
    actualResponse.Item as OrderState,
    (eventResponse.Items ?? []) as LedgerEvent[],
  );

  await Promise.all(
    findings.map((finding) =>
      client.send(new PutCommand({ TableName: tableNames.findings, Item: finding })),
    ),
  );
  return findings;
};
