import { ConflictError } from "@shared/errors";
import { LedgerEvent } from "@shared/events";
import { structuredLog } from "@shared/observability";

export const assertShipmentNotDuplicated = (shipmentCount: number): void => {
  if (shipmentCount > 0) {
    throw new ConflictError("duplicate shipment prevented");
  }
};

export const handler = async (event: LedgerEvent): Promise<{ status: string }> => {
  structuredLog("fulfillment-service", "fulfillment event processed", {
    aggregate_id: event.aggregate_id,
    event_id: event.event_id,
  });
  return { status: "OK" };
};
