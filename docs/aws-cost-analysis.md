# AWS Cost Analysis

Primary cost drivers:
- DynamoDB write volume from EventLedger
- Lambda invocation count across workflow and replay paths
- Step Functions state transitions
- S3 archive and replay scans in later phases
