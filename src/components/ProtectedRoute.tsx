"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
interface ProtectedRouteProps { children: React.ReactNode; allowedRoles?: readonly string[]; unauthorizedRedirect?: string; }
export default function ProtectedRoute({ children, allowedRoles, unauthorizedRedirect = "/account" }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, initialized, user, phase } = useSelector((state: RootState) => state.auth);
  const forbidden = initialized && isAuthenticated && Boolean(allowedRoles && (!user || !allowedRoles.includes(user.role)));
  useEffect(() => { if (initialized && !isAuthenticated && phase !== "unavailable") router.replace("/login"); }, [initialized, isAuthenticated, phase, router]);
  if (!initialized || phase === "restoring") return <main aria-live="polite" className="flex min-h-screen items-center justify-center bg-paper"><p className="text-sm text-mist">Restoring your session…</p></main>;
  if (phase === "unavailable") return <main role="alert" className="mx-auto grid min-h-screen max-w-xl place-items-center px-6 text-center"><div><h1 className="font-display text-3xl font-semibold">Account service unavailable</h1><p className="mt-3 text-mist">Private content remains hidden until the session can be verified.</p><Link className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 font-semibold text-navy-900" href="/login">Try signing in</Link></div></main>;
  if (!isAuthenticated) return null;
  if (forbidden) return <main role="alert" className="mx-auto grid min-h-screen max-w-xl place-items-center px-6 text-center"><div><h1 className="font-display text-3xl font-semibold">You do not have access to this area</h1><p className="mt-3 text-mist">Your verified account role cannot view this operations route.</p><Link className="mt-6 inline-flex rounded-full bg-gold px-5 py-3 font-semibold text-navy-900" href={unauthorizedRedirect}>Back to my account</Link></div></main>;
  return <>{children}</>;
}
