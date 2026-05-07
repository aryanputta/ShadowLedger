import { toRepairPlan } from "../handler";
import { DivergenceFinding } from "@shared/events";

test("inventory leak becomes low-risk release plan", () => {
  const finding = {
    finding_id: "f1",
    finding_type: "INVENTORY_LEAK",
    severity: "HIGH",
    aggregate_id: "order-1",
    expected_state: {},
    actual_state: {},
    root_cause_guess: "",
    repair_strategy: "",
    risk_level: "LOW",
    requires_human_approval: false,
    created_at: "2026-01-01T00:00:00.000Z",
    status: "OPEN",
  } as DivergenceFinding;
  const plan = toRepairPlan(finding);
  expect(plan.repair_type).toBe("RELEASE_INVENTORY");
  expect(plan.requires_human_approval).toBe(false);
});
