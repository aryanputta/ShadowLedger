import { randomUUID } from "crypto";
import { DivergenceFinding, RepairPlan } from "@shared/events";

export const toRepairPlan = (finding: DivergenceFinding): RepairPlan => {
  const lowRiskReplay =
    finding.finding_type === "ORDER_STUCK_AFTER_PAYMENT" ||
    finding.finding_type === "MISSING_TERMINAL_STATE" ||
    finding.finding_type === "STATE_FIELD_DIVERGENCE";
  const lowRiskRelease = finding.finding_type === "INVENTORY_LEAK";

  const repairType = lowRiskRelease
    ? "RELEASE_INVENTORY"
    : lowRiskReplay
      ? "REPLAY_EVENT"
      : "QUARANTINE";

  return {
    repair_plan_id: randomUUID(),
    finding_id: finding.finding_id,
    aggregate_id: finding.aggregate_id,
    repair_type: repairType,
    repair_steps: lowRiskRelease
      ? ["release leaked inventory", "write repair executed event"]
      : lowRiskReplay
        ? ["replay missing workflow step", "verify terminal state"]
        : ["quarantine order", "require human review"],
    risk_level: finding.risk_level,
    requires_human_approval: finding.requires_human_approval,
    approval_status: finding.requires_human_approval ? "PENDING" : "NOT_REQUIRED",
    execution_status: "CREATED",
    created_at: new Date().toISOString(),
  };
};

export const handler = async (finding: DivergenceFinding): Promise<RepairPlan> =>
  toRepairPlan(finding);
