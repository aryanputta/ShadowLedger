import { Construct } from "constructs";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class ObservabilityStack extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: { functions: lambda.IFunction[]; eventLedgerTable: dynamodb.Table },
  ) {
    super(scope, id);

    props.functions.forEach((fn, index) => {
      new cloudwatch.Alarm(this, `LambdaErrorAlarm${index}`, {
        metric: fn.metricErrors(),
        threshold: 1,
        evaluationPeriods: 1,
      });
    });

    new cloudwatch.Alarm(this, "EventLedgerThrottles", {
      metric: props.eventLedgerTable.metricThrottledRequests(),
      threshold: 1,
      evaluationPeriods: 1,
    });
  }
}
