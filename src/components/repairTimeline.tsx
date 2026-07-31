"use client";

import React from "react";
import { Check, Clock, AlertCircle } from "lucide-react";
import { MAP_STATUS_TO_CUSTOMER, InternalRepairStatus  } from "@/app/repair/track/[id]/utils/statusMapper";

interface RepairTimelineProps {
  currentStatus: InternalRepairStatus;
  updatedAt?: string;
}

// Visual stages mapped to customer progression
const TRACKING_STEPS = [
  { id: 0, title: "Received", desc: "Intake request registered" },
  { id: 1, title: "Diagnosis", desc: "Device inspected by tech" },
  { id: 2, title: "Quote Approval", desc: "Cost breakdown & approval" },
  { id: 3, title: "In Repair", desc: "Work & quality assurance" },
  { id: 4, title: "Ready", desc: "Complete & ready for pickup" },
];

export default function RepairTimeline({ currentStatus, updatedAt }: RepairTimelineProps) {
  const currentMapping = MAP_STATUS_TO_CUSTOMER(currentStatus);
  const activeStep = currentMapping.stepIndex;
  const isCancelled = currentStatus === "CANCELLED";

  return (
    <div className="bg-white border border-navy-900/10 rounded-xl p-5 sm:p-6 shadow-sm my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-navy-900/10">
        <div>
          <h3 className="font-bold text-ink text-lg">Repair Progress</h3>
          <p className="text-xs text-mist mt-0.5">
            {updatedAt ? `Last updated: ${new Date(updatedAt).toLocaleDateString()}` : "Live tracking"}
          </p>
        </div>

        {/* Current status pill */}
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto ${currentMapping.badgeColor}`}>
          {currentMapping.label}
        </span>
      </div>

      {/* Cancelled State View */}
      {isCancelled ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-rose-800">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Repair Cancelled</p>
            <p className="text-xs text-rose-700 mt-1">{currentMapping.description}</p>
          </div>
        </div>
      ) : (
        /* Progress Stepper */
        <div className="relative">
          <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-5 sm:gap-2 relative">
            {TRACKING_STEPS.map((step) => {
              const isCompleted = activeStep > step.id;
              const isCurrent = activeStep === step.id;

              return (
                <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center relative">
                  {/* Step Icon Indicator */}
                  <div className="relative z-10">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs transition-all ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-navy-900 text-white ring-4 ring-navy-900/20"
                          : "bg-paper text-mist border border-navy-900/10"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : isCurrent ? (
                        <Clock className="w-4 h-4 animate-pulse" />
                      ) : (
                        <span>{step.id + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* Step Titles */}
                  <div className="flex-1 sm:flex-none">
                    <p className={`text-sm font-semibold ${isCurrent ? "text-navy-900" : isCompleted ? "text-ink" : "text-mist"}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-mist hidden sm:block mt-0.5 max-w-[120px] mx-auto">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Explanation Text Box */}
      <div className="mt-6 p-3.5 bg-paper rounded-lg border border-navy-900/5 text-xs text-mist">
        <strong className="text-ink font-semibold">Current Phase: </strong>
        {currentMapping.description}
      </div>
    </div>
  );
}