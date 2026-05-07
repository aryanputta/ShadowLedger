import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class LambdaStack extends Construct {
  public readonly functions: Record<string, lambda.IFunction>;

  constructor(scope: Construct, id: string, props: { tables: Record<string, dynamodb.Table> }) {
    super(scope, id);

    const mk = (name: string, entry: string) =>
      new nodejs.NodejsFunction(this, name, {
        entry: path.join(__dirname, "..", "..", "..", entry),
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        timeout: cdk.Duration.seconds(15),
        bundling: { externalModules: ["aws-sdk"] },
        environment: {
          EVENT_LEDGER_TABLE: props.tables.eventLedger.tableName,
          ORDERS_TABLE: props.tables.orders.tableName,
          INVENTORY_TABLE: props.tables.inventory.tableName,
          SHADOW_STATE_TABLE: props.tables.shadowState.tableName,
          DIVERGENCE_FINDINGS_TABLE: props.tables.findings.tableName,
          REPAIR_PLANS_TABLE: props.tables.repairPlans.tableName,
        },
      });

    const commandApi = mk("CommandApiFn", "services/command-api/handler.ts");
    const eventLedgerWriter = mk("EventLedgerWriterFn", "services/event-ledger-writer/handler.ts");
    const streamRouter = mk("StreamRouterFn", "services/stream-router/handler.ts");
    const paymentService = mk("PaymentServiceFn", "services/payment-service/handler.ts");
    const inventoryService = mk("InventoryServiceFn", "services/inventory-service/handler.ts");
    const fulfillmentService = mk("FulfillmentServiceFn", "services/fulfillment-service/handler.ts");
    const shadowStateBuilder = mk("ShadowStateBuilderFn", "services/shadow-state-builder/handler.ts");
    const divergenceDetector = mk("DivergenceDetectorFn", "services/divergence-detector/handler.ts");
    const repairPlanner = mk("RepairPlannerFn", "services/repair-planner/handler.ts");
    const repairExecutor = mk("RepairExecutorFn", "services/repair-executor/handler.ts");
    const replayWorker = mk("ReplayWorkerFn", "services/replay-worker/handler.ts");

    Object.values(props.tables).forEach((table) => {
      table.grantReadWriteData(commandApi);
      table.grantReadWriteData(eventLedgerWriter);
      table.grantReadWriteData(streamRouter);
      table.grantReadWriteData(paymentService);
      table.grantReadWriteData(inventoryService);
      table.grantReadWriteData(fulfillmentService);
      table.grantReadWriteData(shadowStateBuilder);
      table.grantReadWriteData(divergenceDetector);
      table.grantReadWriteData(repairPlanner);
      table.grantReadWriteData(repairExecutor);
      table.grantReadWriteData(replayWorker);
    });

    this.functions = {
      commandApi,
      eventLedgerWriter,
      streamRouter,
      paymentService,
      inventoryService,
      fulfillmentService,
      shadowStateBuilder,
      divergenceDetector,
      repairPlanner,
      repairExecutor,
      replayWorker,
    };
  }
}
