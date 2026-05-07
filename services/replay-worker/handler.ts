import { LedgerEvent } from "@shared/events";
import { rebuildShadowState } from "@shared/state-machine";

export type ReplayMode = "DRY_RUN" | "SHADOW_REPLAY" | "REPAIR_REPLAY";

export const replayEvents = (
  aggregateId: string,
  events: LedgerEvent[],
  mode: ReplayMode,
) => {
  const shadow = rebuildShadowState(aggregateId, events);
  return {
    mode,
    aggregate_id: aggregateId,
    replayed_event_count: events.length,
    shadow,
    mutated_production_state: mode === "REPAIR_REPLAY",
  };
};

export const handler = async (event: {
  aggregate_id: string;
  events: LedgerEvent[];
  mode: ReplayMode;
}) => replayEvents(event.aggregate_id, event.events, event.mode);
