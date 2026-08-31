"use client";

import { Check, Clock, AlertCircle } from "lucide-react";
import { MAP_STATUS_TO_CUSTOMER, type InternalRepairStatus } from "@/app/repair/track/[id]/utils/statusMapper";

interface RepairTimelineProps { currentStatus: InternalRepairStatus; updatedAt?: string; }
const TRACKING_STEPS = [
  { id: 0, title: "Received", desc: "Intake request registered" },
  { id: 1, title: "Diagnosis", desc: "Device inspected" },
  { id: 2, title: "Quote approval", desc: "Review the exact quote" },
  { id: 3, title: "In repair", desc: "Work and quality assurance" },
  { id: 4, title: "Ready", desc: "Ready for handover" },
];

export default function RepairTimeline({ currentStatus, updatedAt }: RepairTimelineProps) {
  const mapping = MAP_STATUS_TO_CUSTOMER(currentStatus);
  const activeStep = mapping.stepIndex;
  const isBlocked = currentStatus === "CANCELLED" || currentStatus === "DECLINED";
  return <section aria-labelledby="repair-progress-title" className="my-6 rounded-xl border border-navy-900/10 bg-white p-5 sm:p-6"><div className="mb-6 flex flex-col justify-between gap-2 border-b border-navy-900/10 pb-4 sm:flex-row sm:items-center"><div><h2 id="repair-progress-title" className="text-lg font-bold text-ink">Repair progress</h2><p className="mt-0.5 text-xs text-mist">{updatedAt ? "Last update: " + new Date(updatedAt).toLocaleString() : "Current status"}</p></div><span className={'inline-flex self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-auto ' + mapping.badgeColor}>{mapping.label}</span></div>{isBlocked ? <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div className="text-sm"><p className="font-bold">Repair cannot progress</p><p className="mt-1 text-xs">{mapping.description}</p></div></div> : <ol className="grid gap-5 sm:grid-cols-5 sm:gap-2">{TRACKING_STEPS.map((step) => { const completed = activeStep > step.id; const current = activeStep === step.id; return <li key={step.id} className="flex items-center gap-3 sm:flex-col sm:text-center"><span aria-hidden="true" className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200 motion-reduce:transition-none ' + (completed ? "bg-emerald-600 text-white" : current ? "bg-navy-900 text-white" : "border border-navy-900/10 bg-paper text-mist")}>{completed ? <Check className="h-4 w-4" /> : current ? <Clock className="h-4 w-4" /> : step.id + 1}</span><span><span className={'block text-sm font-semibold ' + (current ? "text-navy-900" : completed ? "text-ink" : "text-mist")}>{step.title}{current ? " (current)" : completed ? " (completed)" : " (expected)"}</span><span className="hidden text-xs text-mist sm:block">{step.desc}</span></span></li>; })}</ol>}<p className="mt-6 rounded-lg bg-paper p-3.5 text-sm text-mist"><strong className="font-semibold text-ink">Current phase: </strong>{mapping.description}</p></section>;
}
