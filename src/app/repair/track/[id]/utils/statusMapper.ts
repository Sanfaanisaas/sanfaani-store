export type InternalRepairStatus =
  | "REQUESTED"
  | "INTAKE_PENDING"
  | "INTAKE_SCHEDULED"
  | "RECEIVED"
  | "IN_CUSTODY"
  | "DIAGNOSING"
  | "QUOTE_PENDING"
  | "QUOTE_SENT"
  | "AWAITING_APPROVAL"
  | "APPROVED"
  | "AWAITING_PARTS"
  | "IN_REPAIR"
  | "PAUSED"
  | "QC_PENDING"
  | "QC"
  | "READY"
  | "READY_FOR_PICKUP"
  | "HANDED_OVER"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED";

export interface StatusMapping {
  label: string;
  description: string;
  stepIndex: number; // 0 to 4 mapped to main visual progress stages
  badgeColor: string; // Tailwind color class
}

export const MAP_STATUS_TO_CUSTOMER = (status: InternalRepairStatus): StatusMapping => {
  switch (status) {
    case "REQUESTED":
    case "INTAKE_PENDING":
      return {
        label: "Request Received",
        description: "We have received your repair intake request and are waiting for device drop-off.",
        stepIndex: 0,
        badgeColor: "bg-blue-100 text-blue-800",
      };
    case "INTAKE_SCHEDULED":
      return {
        label: "Intake Scheduled",
        description: "An intake appointment has been scheduled for your device.",
        stepIndex: 0,
        badgeColor: "bg-blue-100 text-blue-800",
      };
    case "RECEIVED":
    case "IN_CUSTODY":
      return {
        label: "Device Checked In",
        description: "Your device is safely logged into our service shop and queued for inspection.",
        stepIndex: 1,
        badgeColor: "bg-indigo-100 text-indigo-800",
      };
    case "DIAGNOSING":
      return {
        label: "Under Inspection",
        description: "A technician is actively inspecting your device to diagnose the issue.",
        stepIndex: 1,
        badgeColor: "bg-purple-100 text-purple-800",
      };
    case "QUOTE_PENDING":
    case "QUOTE_SENT":
    case "AWAITING_APPROVAL":
      return {
        label: "Action Required: Quote Ready",
        description: "An inspection quote has been generated. Please review and approve to begin repairs.",
        stepIndex: 2,
        badgeColor: "bg-amber-100 text-amber-800 font-semibold animate-pulse",
      };
    case "APPROVED":
    case "AWAITING_PARTS":
    case "IN_REPAIR":
      return {
        label: "Repair in Progress",
        description: "Your quote was approved and work is actively underway on your device.",
        stepIndex: 3,
        badgeColor: "bg-sky-100 text-sky-800",
      };
    case "PAUSED":
      return {
        label: "Repair Paused",
        description: "Work on your device has been temporarily paused. We will resume shortly.",
        stepIndex: 3,
        badgeColor: "bg-amber-100 text-amber-800",
      };
    case "QC_PENDING":
    case "QC":
      return {
        label: "Final Quality Check",
        description: "Repair is complete. Our team is running quality assurance tests before sign-off.",
        stepIndex: 3,
        badgeColor: "bg-teal-100 text-teal-800",
      };
    case "READY":
    case "READY_FOR_PICKUP":
      return {
        label: "Ready for Pickup",
        description: "Your device is tested and ready! You may drop by the shop to collect it.",
        stepIndex: 4,
        badgeColor: "bg-emerald-100 text-emerald-800 font-semibold",
      };
    case "HANDED_OVER":
    case "COMPLETED":
      return {
        label: "Handed Over & Closed",
        description: "This repair order is complete and the device has been collected.",
        stepIndex: 4,
        badgeColor: "bg-gray-100 text-gray-800",
      };
    case "DECLINED":
    case "CANCELLED":
      return {
        label: "Cancelled",
        description: "This repair request was cancelled or declined.",
        stepIndex: -1,
        badgeColor: "bg-rose-100 text-rose-800",
      };
    default:
      return {
        label: "Status Updating",
        description: "Your repair status is being updated by shop staff.",
        stepIndex: 0,
        badgeColor: "bg-gray-100 text-gray-700",
      };
  }
};