"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/ApiState";
import { customerApiMessage } from "@/lib/api/customerStates";
import { listMyClaims, type CustomerClaim } from "@/lib/api/warrantyApi";

function label(status: string) { return status.replaceAll("_", " "); }
export default function WarrantyPage() {
  const [claims, setClaims] = useState<CustomerClaim[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("Warranty claims are unavailable.");
  const load = useCallback(async () => { setState("loading"); try { setClaims(await listMyClaims()); setState("ready"); } catch (error) { setMessage(customerApiMessage(error, "Warranty claims are unavailable.")); setState("error"); } }, []);
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);
  return <main id="main-content" className="mx-auto max-w-4xl px-6 py-12"><h1 className="font-display text-3xl font-semibold">Warranty and claims</h1><section role="status" className="mt-6 rounded-2xl border border-navy-900/10 bg-white p-6"><h2 className="font-semibold">Warranty records are not yet available</h2><p className="mt-2 text-sm text-mist">The backend supports claims for a known eligible warranty, but does not expose an owner warranty list, detail, eligibility, or customer-safe claim-detail endpoint. We cannot safely create a warranty selector or claim form without those records.</p><div className="mt-4 flex flex-wrap gap-4"><Link href="/support" className="font-semibold text-blue underline">Contact support about a warranty</Link><Link href="/account/returns" className="font-semibold text-blue underline">Request a return</Link></div></section><section className="mt-8" aria-labelledby="claims-heading"><h2 id="claims-heading" className="font-display text-2xl font-semibold">My submitted claims</h2>{state === "loading" ? <div className="mt-4"><LoadingState>Loading your claims…</LoadingState></div> : state === "error" ? <div className="mt-4"><ErrorState message={message} onRetry={() => void load()} /></div> : claims.length === 0 ? <div className="mt-4"><EmptyState title="No claims submitted">Submitted claims will appear here.</EmptyState></div> : <ul className="mt-4 space-y-3">{claims.map((claim) => <li key={claim.id} className="rounded-xl border border-navy-900/10 bg-white p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-semibold">Claim {claim.id}</p><p className="text-sm capitalize text-mist">{label(claim.status)}</p></div><p className="mt-2 text-sm text-mist">{claim.description || "No customer description was returned."}</p>{claim.updatedAt && <p className="mt-2 text-xs text-mist">Last updated {new Date(claim.updatedAt).toLocaleString()}</p>}</li>)}</ul>}</section></main>;
}
