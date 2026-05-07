import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { rebuildShadowState } from "@shared/state-machine";
import { tableNames } from "@shared/dynamodb";
import { LedgerEvent, ShadowState } from "@shared/events";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const buildShadowForAggregate = async (aggregateId: string): Promise<ShadowState> => {
  const response = await client.send(
    new QueryCommand({
      TableName: tableNames.eventLedger,
      KeyConditionExpression: "aggregate_id = :aggregate_id",
      ExpressionAttributeValues: { ":aggregate_id": aggregateId },
    }),
  );
  const events = (response.Items ?? []) as LedgerEvent[];
  const shadow = rebuildShadowState(aggregateId, events);
  await client.send(
    new PutCommand({
      TableName: tableNames.shadowState,
      Item: shadow,
    }),
  );
  return shadow;
};

export const handler = async (event: { aggregate_id: string }): Promise<ShadowState> =>
  buildShadowForAggregate(event.aggregate_id);
