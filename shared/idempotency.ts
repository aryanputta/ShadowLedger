import { IdempotencyCollisionError } from "./errors";
import { LedgerEvent } from "./events";

export const assertNoIdempotencyCollision = (
  existing: LedgerEvent | undefined,
  incomingKey: string,
  incomingPayloadHash: string,
): void => {
  if (!existing) {
    return;
  }
  if (
    existing.idempotency_key === incomingKey &&
    existing.payload_hash !== incomingPayloadHash
  ) {
    throw new IdempotencyCollisionError(
      `Idempotency collision for key ${incomingKey}`,
    );
  }
};

export const isDuplicateEvent = (
  existing: LedgerEvent | undefined,
  incomingEventId: string,
): boolean => existing?.event_id === incomingEventId;
