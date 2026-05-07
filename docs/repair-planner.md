# Repair Planner

Low-risk automatic candidates:
- replay missing forward-progress event
- release leaked inventory
- finalize workflow when prerequisites are already true

High-risk cases:
- duplicate payment capture
- duplicate shipment
- inconsistent workflow ordering

High-risk cases are quarantined pending approval.
