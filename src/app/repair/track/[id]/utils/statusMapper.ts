export type InternalRepairStatus = "REQUESTED" | "INTAKE_PENDING" | "INTAKE_SCHEDULED" | "RECEIVED" | "IN_CUSTODY" | "DIAGNOSING" | "QUOTE_PENDING" | "QUOTE_SENT" | "AWAITING_APPROVAL" | "APPROVED" | "AWAITING_PARTS" | "IN_REPAIR" | "PAUSED" | "QC_PENDING" | "QC" | "READY" | "READY_FOR_PICKUP" | "HANDED_OVER" | "COMPLETED" | "DECLINED" | "CANCELLED";
export interface StatusMapping { label: string; description: string; stepIndex: number; badgeColor: string; }
const statuses: Record<InternalRepairStatus, StatusMapping> = {
  REQUESTED: { label: "Request received", description: "We will review your repair request.", stepIndex: 0, badgeColor: "bg-blue-100 text-blue-800" },
  INTAKE_PENDING: { label: "Intake pending", description: "Please arrange device intake with the team.", stepIndex: 0, badgeColor: "bg-blue-100 text-blue-800" },
  INTAKE_SCHEDULED: { label: "Intake scheduled", description: "Bring your device at the scheduled intake time.", stepIndex: 0, badgeColor: "bg-blue-100 text-blue-800" },
  RECEIVED: { label: "Received", description: "Your device has been received for intake.", stepIndex: 1, badgeColor: "bg-indigo-100 text-indigo-800" },
  IN_CUSTODY: { label: "In custody", description: "Your device is securely in our custody.", stepIndex: 1, badgeColor: "bg-indigo-100 text-indigo-800" },
  DIAGNOSING: { label: "Diagnosing", description: "Our technician is diagnosing the device.", stepIndex: 1, badgeColor: "bg-purple-100 text-purple-800" },
  QUOTE_PENDING: { label: "Quote pending", description: "We are preparing an updated quote.", stepIndex: 2, badgeColor: "bg-amber-100 text-amber-800" },
  QUOTE_SENT: { label: "Quote ready", description: "Review the latest quote and accept or decline it.", stepIndex: 2, badgeColor: "bg-amber-100 text-amber-800" },
  AWAITING_APPROVAL: { label: "Awaiting approval", description: "Review the latest quote and accept or decline it.", stepIndex: 2, badgeColor: "bg-amber-100 text-amber-800" },
  APPROVED: { label: "Approved", description: "We are preparing to begin the approved repair.", stepIndex: 3, badgeColor: "bg-sky-100 text-sky-800" },
  AWAITING_PARTS: { label: "Awaiting parts", description: "We are arranging the parts needed for your repair.", stepIndex: 3, badgeColor: "bg-sky-100 text-sky-800" },
  IN_REPAIR: { label: "In repair", description: "Your repair is in progress.", stepIndex: 3, badgeColor: "bg-sky-100 text-sky-800" },
  PAUSED: { label: "Paused", description: "Your repair is temporarily paused while we review the next step.", stepIndex: 3, badgeColor: "bg-amber-100 text-amber-800" },
  QC_PENDING: { label: "Quality checks pending", description: "Your repair is awaiting quality checks.", stepIndex: 3, badgeColor: "bg-teal-100 text-teal-800" },
  QC: { label: "Quality checks", description: "Your repair is undergoing quality checks.", stepIndex: 3, badgeColor: "bg-teal-100 text-teal-800" },
  READY: { label: "Ready", description: "Your repair is ready for handover.", stepIndex: 4, badgeColor: "bg-emerald-100 text-emerald-800" },
  READY_FOR_PICKUP: { label: "Ready for pickup", description: "Your repair is ready for pickup.", stepIndex: 4, badgeColor: "bg-emerald-100 text-emerald-800" },
  HANDED_OVER: { label: "Handed over", description: "Your repaired device has been handed over.", stepIndex: 4, badgeColor: "bg-gray-100 text-gray-800" },
  COMPLETED: { label: "Complete", description: "This repair is complete.", stepIndex: 4, badgeColor: "bg-gray-100 text-gray-800" },
  DECLINED: { label: "Quote declined", description: "The quote was declined; contact support if you would like to discuss next steps.", stepIndex: -1, badgeColor: "bg-rose-100 text-rose-800" },
  CANCELLED: { label: "Cancelled", description: "This repair has been cancelled; contact support for assistance.", stepIndex: -1, badgeColor: "bg-rose-100 text-rose-800" },
};
export const MAP_STATUS_TO_CUSTOMER = (status: InternalRepairStatus) => statuses[status];
