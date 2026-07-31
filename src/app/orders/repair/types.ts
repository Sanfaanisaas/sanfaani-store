export type RepairStatus =
  | "Received"
  | "Diagnosing"
  | "Waiting Approval"
  | "Repairing"
  | "Ready"
  | "Delivered"
  | "Cancelled";

export type RepairPriority = "High" | "Medium" | "Low";

export interface Repair {
  id: string;
  customer: string;
  device: string;
  issue: string;
  status: RepairStatus;
  priority: RepairPriority;
  submittedAt: string;
}