# Event Ledger Design

- Append-only DynamoDB table keyed by `aggregate_id` and `event_timestamp#event_id`
- Conditional writes to reject duplicate event IDs
- `payload_hash` to detect idempotency collision
- `previous_event_hash` to create an integrity chain
- No updates or deletes after insertion
