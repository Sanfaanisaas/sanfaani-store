import { RepairStatus } from "@/app/orders/repair/types";

interface StatusBadgeProps {
  status: RepairStatus;
}

const styles: Record<RepairStatus, string> = {
  Received: "bg-gray-100 text-gray-700",
  Diagnosing: "bg-blue-100 text-blue-700",
  "Waiting Approval": "bg-yellow-100 text-yellow-700",
  Repairing: "bg-purple-100 text-purple-700",
  Ready: "bg-green-100 text-green-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}