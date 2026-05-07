import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DynamoDbStack } from "./dynamodb-stack";
import { LambdaStack } from "./lambda-stack";
import { ApiStack } from "./api-stack";
import { WorkflowStack } from "./workflow-stack";
import { ObservabilityStack } from "./observability-stack";

export class ShadowLedgerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const db = new DynamoDbStack(this, "Dynamo");
    const lambdas = new LambdaStack(this, "Lambdas", { tables: db.tables });
    new ApiStack(this, "Api", { commandApi: lambdas.functions.commandApi });
    new WorkflowStack(this, "Workflow", { functions: lambdas.functions });
    new ObservabilityStack(this, "Observability", {
      functions: Object.values(lambdas.functions),
      eventLedgerTable: db.tables.eventLedger,
    });
  }
}
