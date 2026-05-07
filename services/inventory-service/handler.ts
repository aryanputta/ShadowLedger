import { ConflictError } from "@shared/errors";
import { structuredLog } from "@shared/observability";
import { InventoryState, LedgerEvent } from "@shared/events";

export const reserveInventory = (
  inventory: InventoryState,
  event: LedgerEvent,
): InventoryState => {
  const quantity = Number(event.payload.quantity ?? 0);
  if (inventory.available_quantity < quantity) {
    throw new ConflictError("insufficient inventory");
  }
  return {
    ...inventory,
    available_quantity: inventory.available_quantity - quantity,
    reserved_quantity: inventory.reserved_quantity + quantity,
    version: inventory.version + 1,
    last_updated_at: event.event_timestamp,
  };
};

export const releaseInventory = (
  inventory: InventoryState,
  quantity: number,
  timestamp: string,
): InventoryState => {
  if (inventory.reserved_quantity < quantity) {
    throw new ConflictError("double release prevented");
  }
  return {
    ...inventory,
    available_quantity: inventory.available_quantity + quantity,
    reserved_quantity: inventory.reserved_quantity - quantity,
    version: inventory.version + 1,
    last_updated_at: timestamp,
  };
};

export const handler = async (event: LedgerEvent): Promise<{ status: string }> => {
  structuredLog("inventory-service", "received workflow event", {
    event_id: event.event_id,
    aggregate_id: event.aggregate_id,
  });
  return { status: "OK" };
};
