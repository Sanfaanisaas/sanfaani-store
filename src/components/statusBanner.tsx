import type { RepairStatus } from "@/lib/api/contracts";
export default function StatusBanner({ status }: { status: RepairStatus }) { return <p role="status" className="rounded-xl bg-paper p-3 text-sm text-ink">Repair status: {status}</p>; }
