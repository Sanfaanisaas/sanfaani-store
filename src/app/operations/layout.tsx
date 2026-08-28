import type { Metadata } from "next";
import ProtectedRoute from "@/components/ProtectedRoute";
import { OPERATIONS_ROLES } from "@/lib/api/contracts";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function OperationsLayout({ children }: { children: React.ReactNode }) { return <ProtectedRoute allowedRoles={OPERATIONS_ROLES}>{children}</ProtectedRoute>; }
