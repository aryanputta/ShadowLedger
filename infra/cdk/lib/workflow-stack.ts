import { Construct } from "constructs";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class WorkflowStack extends Construct {
  constructor(scope: Construct, id: string, props: { functions: Record<string, lambda.IFunction> }) {
    super(scope, id);

    const definition = new tasks.LambdaInvoke(this, "AuthorizePayment", {
      lambdaFunction: props.functions.paymentService,
      outputPath: "$.Payload",
    })
      .next(
        new tasks.LambdaInvoke(this, "ReserveInventory", {
          lambdaFunction: props.functions.inventoryService,
          outputPath: "$.Payload",
        }),
      )
      .next(
        new tasks.LambdaInvoke(this, "RequestFulfillment", {
          lambdaFunction: props.functions.fulfillmentService,
          outputPath: "$.Payload",
        }),
      );

    new sfn.StateMachine(this, "OrderSaga", {
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
    });
  }
}
