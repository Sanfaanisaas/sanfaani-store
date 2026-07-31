import {Repair} from "@/app/orders/repair/types";

export const mockRepairs: Repair[] = [
  {
    id: "RP-1001",
    customer: "John Doe",
    device: "Dell XPS 15",
    issue: "Broken Screen",
    status: "Received",
    priority: "High",
    submittedAt: "2026-07-31",
  },
  {
    id: "RP-1002",
    customer: "Alice Smith",
    device: "iPhone 14",
    issue: "Battery Replacement",
    status: "Repairing",
    priority: "Medium",
    submittedAt: "2026-07-30",
  },
  {
    id: "RP-1003",
    customer: "Michael Brown",
    device: "MacBook Air M2",
    issue: "Keyboard Issue",
    status: "Diagnosing",
    priority: "Low",
    submittedAt: "2026-07-29",
  },
  {
    id: "RP-1004",
    customer: "Sarah Johnson",
    device: "HP EliteBook",
    issue: "Water Damage",
    status: "Waiting Approval",
    priority: "High",
    submittedAt: "2026-07-28",
  },
  {
    id: "RP-1005",
    customer: "David Wilson",
    device: "Samsung Galaxy S25",
    issue: "Charging Port",
    status: "Ready",
    priority: "Medium",
    submittedAt: "2026-07-27",
  },
];