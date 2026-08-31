"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import Navbar from "@/components/Navbar";
import { customerApiMessage, fieldErrors } from "@/lib/api/customerStates";
import { createRepair, type CreatedRepair } from "@/lib/api/repairsApi";
import { evidenceValidationMessage, uploadEvidenceFile } from "@/lib/api/evidenceApi";

export default function RepairRequestPage() {
  const [device, setDevice] = useState({ type: "", brand: "", model: "", serialNumber: "" });
  const [description, setDescription] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitted, setSubmitted] = useState<CreatedRepair | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePending, setEvidencePending] = useState(false);
  const [evidenceMessage, setEvidenceMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setMessage(null);
    setErrors({});
    if (!acknowledged) {
      setErrors({ privacyAcknowledged: "You must acknowledge the device-data policy before submitting." });
      return;
    }
    setPending(true);
    try {
      setSubmitted(await createRepair({
        device: { ...device, ...(device.serialNumber.trim() ? { serialNumber: device.serialNumber.trim() } : {}) },
        issueDescription: description.trim(),
        privacyAcknowledged: true,
      }));
    } catch (error) {
      setErrors(fieldErrors(error));
      setMessage(customerApiMessage(error, "We could not submit your repair request."));
    } finally {
      setPending(false);
    }
  }

  async function uploadEvidence() {
    if (!submitted || !evidenceFile || evidencePending) return;
    const validation = evidenceValidationMessage(evidenceFile);
    if (validation) { setEvidenceMessage(validation); return; }
    setEvidencePending(true); setEvidenceMessage("");
    try { await uploadEvidenceFile({ file: evidenceFile, subjectType: "repair", subjectId: submitted.repairId, purpose: "repair_intake" }); setEvidenceFile(null); setEvidenceMessage("Evidence was confirmed by the service."); }
    catch (error) { setEvidenceMessage(customerApiMessage(error, "We could not upload that evidence.")); }
    finally { setEvidencePending(false); }
  }

  if (submitted) {
    return <><Navbar /><main id="main-content" className="mx-auto max-w-xl px-6 py-14"><section className="rounded-3xl border border-navy-900/10 bg-white p-8"><h1 className="font-display text-3xl font-semibold">Repair request submitted</h1><p role="status" className="mt-3 text-mist">Your request was confirmed by the repair service. Keep both references private.</p><dl className="mt-6 space-y-4 rounded-2xl bg-paper p-5 text-sm"><div><dt className="font-semibold text-ink">Repair reference</dt><dd className="mt-1 break-all text-mist">{submitted.repairId}</dd></div><div><dt className="font-semibold text-ink">One-time tracking credential</dt><dd className="mt-1 break-all font-mono text-ink">{submitted.trackingToken}</dd></div><div><dt className="font-semibold text-ink">Credential expires</dt><dd className="mt-1 text-mist">{new Date(submitted.trackingTokenExpiresAt).toLocaleString()}</dd></div></dl><section className="mt-6 rounded-2xl border border-navy-900/10 p-5"><h2 className="font-semibold">Optional repair evidence</h2><p className="mt-1 text-sm text-mist">Attach one JPEG, PNG, or PDF no larger than 5 MiB. The server validates the file and records no storage key in this page.</p><label className="mt-3 block text-sm font-semibold">Evidence file<input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(event) => { setEvidenceFile(event.currentTarget.files?.[0] ?? null); setEvidenceMessage(""); }} className="mt-1 block w-full text-sm font-normal" /></label><button type="button" disabled={!evidenceFile || evidencePending} onClick={() => void uploadEvidence()} className="mt-3 rounded-full border border-navy-900/20 px-4 py-2 text-sm font-semibold disabled:opacity-50">{evidencePending ? "Uploading…" : "Upload evidence"}</button>{evidenceMessage && <p role="status" className="mt-3 text-sm text-mist">{evidenceMessage}</p>}</section><p className="mt-4 text-sm text-mist">This credential is shown only in this page view. It is not saved in your browser or included in a link.</p><div className="mt-6 flex flex-wrap gap-4"><Link href={"/repair/track/" + encodeURIComponent(submitted.repairId)} className="rounded-full bg-gold px-5 py-3 font-semibold text-navy-900">Track this repair</Link><Link href="/account" className="self-center text-sm font-semibold text-blue underline">Go to my account</Link></div></section></main></>;
  }

  return <><Navbar /><main id="main-content" className="mx-auto max-w-2xl px-6 py-10"><h1 className="font-display text-3xl font-semibold">Request a repair</h1><p className="mt-2 text-sm text-mist">Your request is sent as JSON through the authenticated repair API. Customer evidence is not requested here because repair creation has no evidence field; we do not use staff intake routes.</p><form noValidate onSubmit={submit} className="mt-7 space-y-5 rounded-3xl border border-navy-900/10 bg-white p-6"><fieldset><legend className="font-semibold">Device details</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{([['type','Device type'],['brand','Brand'],['model','Model'],['serialNumber','Serial / IMEI (optional)']] as const).map(([key,label]) => <label key={key} className="text-sm font-semibold">{label}<input required={key !== "serialNumber"} aria-invalid={Boolean(errors['device.' + key])} aria-describedby={errors['device.' + key] ? 'device-' + key + '-error' : undefined} value={device[key]} onChange={(event) => setDevice({ ...device, [key]: event.target.value })} className="mt-1 w-full rounded-xl border border-navy-900/20 p-2" />{errors['device.' + key] && <span id={'device-' + key + '-error'} className="mt-1 block text-xs font-normal text-red-700">{errors['device.' + key]}</span>}</label>)}</div></fieldset><label className="block text-sm font-semibold">Describe the issue<textarea required minLength={5} aria-invalid={Boolean(errors.issueDescription)} aria-describedby={errors.issueDescription ? "issue-error" : undefined} value={description} onChange={(event) => setDescription(event.target.value)} rows={5} className="mt-1 w-full rounded-xl border border-navy-900/20 p-2" /></label>{errors.issueDescription && <p id="issue-error" className="-mt-3 text-xs text-red-700">{errors.issueDescription}</p>}<label className="flex gap-3 rounded-xl bg-paper p-4 text-sm"><input required type="checkbox" checked={acknowledged} aria-invalid={Boolean(errors.privacyAcknowledged)} onChange={(event) => setAcknowledged(event.target.checked)} /><span>I acknowledge the <Link href="/policies/device-data" className="font-semibold text-blue underline">device-data policy</Link> and confirm that I have backed up important data.</span></label>{errors.privacyAcknowledged && <p className="-mt-3 text-xs text-red-700">{errors.privacyAcknowledged}</p>}{message && <p role="alert" className="text-sm text-red-700">{message}</p>}<button disabled={pending} className="w-full rounded-full bg-gold px-5 py-3 font-semibold text-navy-900 disabled:opacity-50">{pending ? "Submitting…" : "Submit repair request"}</button></form></main></>;
}
