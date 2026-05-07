import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class ApiStack extends Construct {
  constructor(scope: Construct, id: string, props: { commandApi: lambda.IFunction }) {
    super(scope, id);

    const api = new apigateway.RestApi(this, "ShadowLedgerApi", {
      restApiName: "ShadowLedger API",
      deployOptions: { stageName: "dev" },
    });
    api.root.addResource("orders").addMethod("POST", new apigateway.LambdaIntegration(props.commandApi));
  }
}
