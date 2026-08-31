import ProtectedRoute from "@/components/ProtectedRoute";

const REPAIR_QUEUE_ROLES = [
  "store_operator",
  "technician",
  "qc_officer",
  "sales_advisor",
  "inventory_officer",
  "finance_officer",
  "support_officer",
  "ops_manager",
  "product_admin",
  "tech_admin",
  "super_admin",
] as const;

export default function RepairOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={REPAIR_QUEUE_ROLES}>
      {children}
    </ProtectedRoute>
  );
}
