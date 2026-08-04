import ProtectedRoute from "@/components/ProtectedRoute";
import { USER_ROLES } from "@/lib/constants";

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <ProtectedRoute allowedRoles={[USER_ROLES.PRODUCT_ADMIN, USER_ROLES.SUPER_ADMIN]}> */}
      {children}
      {/* </ProtectedRoute>     */}
    </>

  );
}
