"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: readonly string[];
  unauthorizedRedirect?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  unauthorizedRedirect = "/account",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, initialized, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace("/login");
    } else if (
      initialized &&
      isAuthenticated &&
      allowedRoles &&
      (!user || !allowedRoles.includes(user.role))
    ) {
      router.replace(unauthorizedRedirect);
    }
  }, [allowedRoles, initialized, isAuthenticated, router, unauthorizedRedirect, user]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-mist">Loading your account...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
