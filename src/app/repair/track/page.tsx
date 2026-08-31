"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { rememberTrackingToken } from "@/lib/api/repairsApi";

export default function RepairTrackingEntry() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [trackingToken, setTrackingToken] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const repairId = trackingId.trim();
    if (!repairId) return;
    if (trackingToken.trim()) rememberTrackingToken(repairId, trackingToken.trim());
    router.push("/repair/track/" + encodeURIComponent(repairId));
  }

  return <><Navbar /><main id="main-content" className="mx-auto max-w-lg px-6 py-16 sm:py-24"><section className="rounded-xl border border-navy-900/10 bg-white p-8"><div className="mb-8 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold"><Search className="h-6 w-6" /></div><h1 className="font-display text-2xl font-bold text-ink">Track your repair</h1><p className="mt-2 text-sm text-mist">Enter the repair reference. If you are not signed in, add the one-time tracking credential received when the request was created.</p></div><form onSubmit={submit} className="space-y-4"><label htmlFor="trackingId" className="block text-sm font-medium text-ink">Repair reference<input id="trackingId" required value={trackingId} onChange={(event) => setTrackingId(event.target.value)} className="mt-1.5 w-full rounded-md border border-navy-900/10 bg-paper p-2.5 text-sm text-ink outline-none transition-colors focus:border-gold" /></label><label htmlFor="trackingToken" className="block text-sm font-medium text-ink">Tracking credential <span className="font-normal text-mist">(required when signed out)</span><input id="trackingToken" type="password" autoComplete="off" value={trackingToken} onChange={(event) => setTrackingToken(event.target.value)} className="mt-1.5 w-full rounded-md border border-navy-900/10 bg-paper p-2.5 text-sm text-ink outline-none transition-colors focus:border-gold" /><span className="mt-1 block text-xs font-normal text-mist">Kept only in memory for this browser tab. It is never added to the link.</span></label><button type="submit" disabled={!trackingId.trim()} className="flex w-full items-center justify-center rounded-lg bg-gold py-3 text-sm font-bold text-navy-900 disabled:opacity-50">Track repair</button></form></section></main></>;
}
