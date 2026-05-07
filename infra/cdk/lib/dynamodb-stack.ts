import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class DynamoDbStack extends Construct {
  public readonly tables: Record<string, dynamodb.Table>;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const eventLedger = new dynamodb.Table(this, "EventLedger", {
      tableName: "ShadowLedger-EventLedger",
      partitionKey: { name: "aggregate_id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sort_key", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_IMAGE,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const orders = new dynamodb.Table(this, "Orders", {
      tableName: "ShadowLedger-Orders",
      partitionKey: { name: "order_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const inventory = new dynamodb.Table(this, "Inventory", {
      tableName: "ShadowLedger-Inventory",
      partitionKey: { name: "sku", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const shadowState = new dynamodb.Table(this, "ShadowState", {
      tableName: "ShadowLedger-ShadowState",
      partitionKey: { name: "aggregate_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const findings = new dynamodb.Table(this, "DivergenceFindings", {
      tableName: "ShadowLedger-DivergenceFindings",
      partitionKey: { name: "finding_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    findings.addGlobalSecondaryIndex({
      indexName: "aggregate_id-created_at-index",
      partitionKey: { name: "aggregate_id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "created_at", type: dynamodb.AttributeType.STRING },
    });

    const repairPlans = new dynamodb.Table(this, "RepairPlans", {
      tableName: "ShadowLedger-RepairPlans",
      partitionKey: { name: "repair_plan_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.tables = { eventLedger, orders, inventory, shadowState, findings, repairPlans };
  }
}
