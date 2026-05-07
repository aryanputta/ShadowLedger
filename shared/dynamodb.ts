export const tableNames = {
  eventLedger: process.env.EVENT_LEDGER_TABLE ?? "ShadowLedger-EventLedger",
  orders: process.env.ORDERS_TABLE ?? "ShadowLedger-Orders",
  inventory: process.env.INVENTORY_TABLE ?? "ShadowLedger-Inventory",
  shadowState: process.env.SHADOW_STATE_TABLE ?? "ShadowLedger-ShadowState",
  findings: process.env.DIVERGENCE_FINDINGS_TABLE ?? "ShadowLedger-DivergenceFindings",
  repairPlans: process.env.REPAIR_PLANS_TABLE ?? "ShadowLedger-RepairPlans",
};
