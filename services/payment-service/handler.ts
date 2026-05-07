import { ConflictError } from "@shared/errors";
import { LedgerEvent } from "@shared/events";
import { structuredLog } from "@shared/observability";

export const simulatePayment = (
  existingCaptureCount: number,
  chaosMode = false,
): "PAYMENT_AUTHORIZED" | "PAYMENT_CAPTURED" | "PAYMENT_FAILED" => {
  if (existingCaptureCount > 0) {
    throw new ConflictError("double capture prevented");
  }
  if (chaosMode) {
    return "PAYMENT_FAILED";
  }
  return "PAYMENT_CAPTURED";
};

export const handler = async (event: LedgerEvent): Promise<{ status: string }> => {
  structuredLog("payment-service", "payment event processed", {
    aggregate_id: event.aggregate_id,
    event_id: event.event_id,
  });
  return { status: "OK" };
};
