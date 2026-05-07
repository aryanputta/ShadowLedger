import { UnsafeRepairError } from "@shared/errors";
import { RepairPlan } from "@shared/events";

export const executeRepair = (plan: RepairPlan): RepairPlan => {
  if (plan.requires_human_approval && plan.approval_status !== "APPROVED") {
    throw new UnsafeRepairError("repair requires approval");
  }
  if (plan.execution_status === "EXECUTED") {
    throw new UnsafeRepairError("repair already executed");
  }
  return {
    ...plan,
    execution_status: "EXECUTED",
    executed_at: new Date().toISOString(),
  };
};

export const handler = async (plan: RepairPlan): Promise<RepairPlan> => executeRepair(plan);
