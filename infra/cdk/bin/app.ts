import * as cdk from "aws-cdk-lib";
import { ShadowLedgerStack } from "../lib/shadowledger-stack";

const app = new cdk.App();
new ShadowLedgerStack(app, "ShadowLedgerStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "us-east-1",
  },
});
