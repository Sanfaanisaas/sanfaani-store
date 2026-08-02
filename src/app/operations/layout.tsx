import ProtectedRoute from "@/components/ProtectedRoute";

const OPERATIONS_ROLES = [
  "customer",
  "sales_advisor",
  "store_operator",
  "technician",
  "qc_officer",
  "inventory_officer",
  "support_officer",
  "finance_officer",
  "merchandiser",
  "ops_manager",
  "product_admin",
  "tech_admin",
  "super_admin",
] as const;

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={OPERATIONS_ROLES}>{children}</ProtectedRoute>;
}
