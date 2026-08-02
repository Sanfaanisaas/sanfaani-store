import ProtectedRoute from "@/components/ProtectedRoute";

const PRODUCT_ADMIN_ROLES = ["product_admin", "super_admin"] as const;

export default function AdminOperationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={PRODUCT_ADMIN_ROLES} unauthorizedRedirect="/account">
      {children}
    </ProtectedRoute>
  );
}
