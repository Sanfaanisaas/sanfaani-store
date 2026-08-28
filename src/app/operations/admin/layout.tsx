import ProtectedRoute from "@/components/ProtectedRoute";
import { OPERATIONS_ROLES } from "@/lib/api/contracts";
export default function AdminOperationsLayout({ children }: { children: React.ReactNode }) { return <ProtectedRoute allowedRoles={OPERATIONS_ROLES}>{children}</ProtectedRoute>; }
