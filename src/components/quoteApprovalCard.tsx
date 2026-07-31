"use client";

import React, { useState } from "react";
import { Check, X, AlertCircle, Clock, ShieldCheck, FileText, Loader2 } from "lucide-react";

export interface QuoteItem {
  id: string;
  description: string;
  quantity?: number;
  amount: number; // Make sure 'amount' is explicitly defined here
}

export interface Quote {
  version: number;
  items: QuoteItem[];
  totalAmount: number;
  estimatedDays: number;
  status: "PENDING" | "APPROVED" | "DECLINED" | "SUPERSEDED";
  createdAt: string;
  notes?: string;
}

interface QuoteApprovalCardProps {
  repairId: string;
  quote?: Quote | null; // Allow optional or null quote
  onApprove: (quoteVersion: number) => Promise<void>;
  onDecline: (quoteVersion: number, reason?: string) => Promise<void>;
}

export default function QuoteApprovalCard({
  repairId,
  quote,
  onApprove,
  onDecline,
}: QuoteApprovalCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Safe Guard: If no quote exists yet for this repair order
  if (!quote) {
    return (
      <div className="bg-paper border border-navy-900/10 rounded-xl p-5 my-6 text-center text-sm text-mist">
        <Clock className="w-5 h-5 mx-auto mb-2 text-navy-900/40" />
        <p className="font-medium text-ink">No Quote Issued Yet</p>
        <p className="text-xs text-mist mt-1">
          Our technicians are inspecting your device. A detailed cost estimate will appear here once ready.
        </p>
      </div>
    );
  }

  // 2. Safe to access status now that we verified quote is defined
  const isPending = quote.status === "PENDING";

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onApprove(quote.version);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to approve quote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onDecline(quote.version, declineReason);
      setShowDeclineModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to decline quote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-navy-900/10 rounded-xl shadow-sm overflow-hidden my-6">
      {/* Header */}
      <div className="bg-paper p-5 border-b border-navy-900/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-navy-900" />
          <h3 className="font-bold text-ink text-lg">
            Repair Quote <span className="text-mist font-normal text-sm">(v{quote.version})</span>
          </h3>
        </div>

        {/* Status Tag */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            quote.status === "PENDING"
              ? "bg-amber-100 text-amber-800"
              : quote.status === "APPROVED"
              ? "bg-emerald-100 text-emerald-800"
              : quote.status === "DECLINED"
              ? "bg-rose-100 text-rose-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {quote.status === "PENDING" ? "Awaiting Your Approval" : quote.status}
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Note / Diagnostic Summary */}
        {quote.notes && (
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3.5 text-sm text-amber-900">
            <p className="font-semibold text-xs text-amber-800 uppercase tracking-wider mb-0.5">
              Technician Diagnosis Summary
            </p>
            {quote.notes}
          </div>
        )}

        {/* Itemized Line Items */}
        <div>
          <h4 className="text-xs font-semibold text-mist uppercase tracking-wider mb-3">
            Cost Breakdown
          </h4>
          <div className="space-y-2 border-b border-navy-900/10 pb-4">
            {(quote.items || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm text-ink">
                <span>{item.description}</span>
                <span className="font-medium font-mono">
                  {"\u20A6"}{item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Total Cost */}
          <div className="flex items-center justify-between pt-3 text-base font-bold text-ink">
            <span>Total Estimated Cost</span>
            <span className="text-xl text-navy-900 font-mono">
              {"\u20A6"}{quote.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Turnaround Time */}
        <div className="flex items-center gap-2 text-sm text-mist bg-paper p-3 rounded-lg border border-navy-900/5">
          <Clock className="w-4 h-4 text-navy-900 shrink-0" />
          <span>
            Estimated turnaround time upon approval:{" "}
            <strong className="text-ink">{quote.estimatedDays} business day(s)</strong>
          </span>
        </div>

        {/* Action Controls */}
        {isPending ? (
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleApprove}
              className="flex-1 bg-gold hover:bg-gold/95 text-gray/95 text-navy-900  font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Approve & Authorize Repair</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowDeclineModal(true)}
              className="border border-navy-900/20 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-ink font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>Decline Quote</span>
            </button>
          </div>
        ) : (
          <div className="p-3 bg-paper rounded-lg border border-navy-900/10 text-center text-xs text-mist">
            <ShieldCheck className="w-4 h-4 text-emerald-600 inline mr-1" />
            This quote response is recorded and locked.
          </div>
        )}
      </div>

      {/* Decline Confirmation Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-ink">Decline Repair Quote?</h3>
            <p className="text-sm text-mist">
              If you decline this quote, work will not proceed and your device will be prepared for collection as-is.
            </p>

            <form onSubmit={handleDeclineSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Reason for declining (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Cost too high, deciding to buy a new device..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full bg-paper border border-navy-900/10 rounded-lg p-2.5 text-sm text-ink outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeclineModal(false)}
                  className="px-4 py-2 text-sm font-medium text-mist hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Decline</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}