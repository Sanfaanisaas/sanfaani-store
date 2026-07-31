"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  UploadCloud, 
  ArrowLeft 
} from "lucide-react";

// Types matching your Mongoose Warranty Schema
export interface WarrantyRecord {
  _id: string;
  repair: string; // ObjectId reference to Repair -> maps to relatedRepair
  customer: string; // ObjectId reference to User
  deviceSummary: string;
  issuedAt: string;
  expiresAt: string;
}

// Type matching your SupportTicket schema payload
export interface CreatedSupportTicket {
  ticketId: string;
  customer: string;
  subject: string;
  relatedRepair: string;
  status: string; // e.g. SUPPORT_TICKET_STATUS.OPEN
  initialMessage: string;
  createdAt: string;
}

// Mock database records
const MOCK_WARRANTIES: WarrantyRecord[] = [
  {
    _id: "66a98f12c8230911a2",
    repair: "66b10298a4112001c1", // ObjectId for Repair
    customer: "66a01092b3121009e5", // ObjectId for User
    deviceSummary: "iPhone 13 Pro - OLED Screen & Glass Replacement",
    issuedAt: "2026-06-15T08:00:00.000Z",
    expiresAt: "2026-09-15T08:00:00.000Z", // Active
  },
  {
    _id: "66a98f12c8230911a3",
    repair: "66b10298a4112001c2",
    customer: "66a01092b3121009e5",
    deviceSummary: "Samsung Galaxy S22 - Battery Replacement",
    issuedAt: "2026-05-01T08:00:00.000Z",
    expiresAt: "2026-08-01T08:00:00.000Z", // Active
  },
  {
    _id: "66a98f12c8230911a4",
    repair: "66b10298a4112001c3",
    customer: "66a01092b3121009e5",
    deviceSummary: "MacBook Pro 14\" - Charging Port Soldering",
    issuedAt: "2026-01-10T08:00:00.000Z",
    expiresAt: "2026-04-10T08:00:00.000Z", // Expired
  },
];

export default function WarrantyClaimPage() {
  const [warranties] = useState<WarrantyRecord[]>(MOCK_WARRANTIES);
  
  // Form Input States
  const [selectedWarrantyId, setSelectedWarrantyId] = useState<string>("");
  const [issueCategory, setIssueCategory] = useState<string>("DEFECT");
  const [description, setDescription] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdTicket, setCreatedTicket] = useState<CreatedSupportTicket | null>(null);

  // Selected warranty entity lookup
  const selectedWarranty = warranties.find((w) => w._id === selectedWarrantyId) || null;

  // Expiration helper
  const getDaysRemaining = (expiresAt: string) => {
    const diffTime = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isExpired = selectedWarranty ? getDaysRemaining(selectedWarranty.expiresAt) <= 0 : false;

  // Submit Handler -> Builds SupportTicket payload
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarranty || isExpired) return;

    setIsSubmitting(true);

    // Form constructed payload matching SupportTicket schema fields
    const supportTicketPayload = {
      customer: selectedWarranty.customer, // Logged-in user ID
      subject: `[Warranty Claim] ${selectedWarranty.deviceSummary} (${issueCategory})`,
      relatedRepair: selectedWarranty.repair, // Repair ObjectId
      relatedOrder: null,
      messages: [
        {
          body: description,
        },
      ],
    };

    console.log("Payload sending to backend POST /api/tickets:", supportTicketPayload);

    // Simulate API Delay
    setTimeout(() => {
      setIsSubmitting(false);
      setCreatedTicket({
        ticketId: `TCK-${Math.floor(100000 + Math.random() * 900000)}`,
        customer: supportTicketPayload.customer,
        subject: supportTicketPayload.subject,
        relatedRepair: supportTicketPayload.relatedRepair,
        status: "OPEN", // Default from SUPPORT_TICKET_STATUS.OPEN
        initialMessage: description,
        createdAt: new Date().toLocaleString(),
      });
    }, 1200);
  };

  const handleReset = () => {
    setCreatedTicket(null);
    setSelectedWarrantyId("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Navigation Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Submit Warranty Claim</h1>
            <p className="text-xs text-mist mt-1">
              Creates an open Support Ticket linked directly to your repair record.
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => window.history.back()}
            className="text-xs font-semibold text-ink hover:text-navy-900 flex items-center gap-1 bg-white px-3 py-2 rounded-lg border border-navy-900/10 shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        {/* --- VIEW: TICKET CREATED RECAP --- */}
        {createdTicket ? (
          <div className="bg-white border border-navy-900/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold font-mono tracking-wider text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full uppercase border border-amber-200">
                Ticket Created • {createdTicket.ticketId}
              </span>
              <h2 className="text-xl font-bold text-ink pt-2">Support Ticket Opened</h2>
              <p className="text-xs text-mist max-w-sm mx-auto">
                Your ticket has been logged with status <strong className="text-amber-700">{createdTicket.status}</strong>. Our support team will respond shortly.
              </p>
            </div>

            {/* Generated SupportTicket Fields Mapping */}
            <div className="bg-paper border border-navy-900/10 rounded-xl p-4 text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-navy-900/10 pb-2">
                <span className="text-mist font-medium">Ticket Subject:</span>
                <span className="font-semibold text-ink text-right max-w-[240px] truncate">{createdTicket.subject}</span>
              </div>
              <div className="flex justify-between items-center border-b border-navy-900/10 pb-2">
                <span className="text-mist font-medium">Related Repair ObjectId:</span>
                <span className="font-mono font-bold text-navy-900">{createdTicket.relatedRepair}</span>
              </div>
              <div className="flex justify-between items-center border-b border-navy-900/10 pb-2">
                <span className="text-mist font-medium">Ticket Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                  {createdTicket.status}
                </span>
              </div>
              <div>
                <span className="text-mist font-medium block mb-1">Initial Message Body:</span>
                <p className="text-ink italic bg-white p-2.5 rounded border border-navy-900/10 text-xs">
                  "{createdTicket.initialMessage}"
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold py-3 rounded-xl text-xs transition-colors shadow-md"
            >
              File Another Claim
            </button>
          </div>
        ) : (
          /* --- VIEW: FORM ENTRY --- */
          <form onSubmit={handleSubmit} className="bg-white border border-navy-900/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            
            {/* 1. Device Selection (Maps to relatedRepair) */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Select Covered Device / Repair
              </label>
              <select
                value={selectedWarrantyId}
                onChange={(e) => setSelectedWarrantyId(e.target.value)}
                required
                className="w-full bg-paper border border-navy-900/10 rounded-xl p-3 text-sm text-ink outline-none focus:border-gold transition-all cursor-pointer"
              >
                <option value="">-- Choose repair record --</option>
                {warranties.map((w) => {
                  const days = getDaysRemaining(w.expiresAt);
                  const expired = days <= 0;
                  return (
                    <option key={w._id} value={w._id}>
                      {w.deviceSummary} — {expired ? "EXPIRED" : `${days} Days Left`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 2. Active Warranty Status Display */}
            {selectedWarranty && (
              <div className={`border rounded-xl p-4 text-xs space-y-3 transition-all ${
                isExpired 
                  ? "bg-rose-50/60 border-rose-200" 
                  : "bg-amber-50/60 border-amber-200/80"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isExpired ? (
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                    )}
                    <span className={`font-bold ${isExpired ? "text-rose-900" : "text-amber-950"}`}>
                      {isExpired ? "Warranty Expired" : "Active Warranty Coverage"}
                    </span>
                  </div>
                  <span className={`font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
                    isExpired ? "bg-rose-200 text-rose-900" : "bg-gold text-navy-950"
                  }`}>
                    {isExpired ? "EXPIRED" : `${getDaysRemaining(selectedWarranty.expiresAt)} DAYS REMAINING`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-navy-900/10 text-mist">
                  <div>
                    Issued: <strong className="text-ink">{new Date(selectedWarranty.issuedAt).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    Expires: <strong className="text-ink">{new Date(selectedWarranty.expiresAt).toLocaleDateString()}</strong>
                  </div>
                </div>

                {isExpired && (
                  <div className="flex items-center gap-2 text-rose-800 bg-rose-100/80 p-2.5 rounded-lg text-[11px]">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>This item is no longer covered. Please submit a standard repair request.</span>
                  </div>
                )}
              </div>
            )}

            {/* 3. Issue Category (Constructs Subject) */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Defect Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "DEFECT", label: "Part Malfunction" },
                  { id: "INSTALLATION", label: "Fit / Assembly Issue" },
                  { id: "OTHER", label: "Unresolved Symptom" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setIssueCategory(cat.id)}
                    className={`p-2.5 text-xs font-medium rounded-xl border transition-all text-center ${
                      issueCategory === cat.id 
                        ? "bg-navy-900 text-white border-navy-900 shadow-sm" 
                        : "bg-paper text-ink border-navy-900/10 hover:border-gold"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Description (Maps to messages[0].body) */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Detailed Defect Explanation
              </label>
              <textarea
                rows={4}
                required
                disabled={!selectedWarranty || isExpired}
                placeholder={
                  selectedWarranty 
                    ? "Explain what malfunction occurred after the repair..." 
                    : "Select a valid warranty above first..."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-paper border border-navy-900/10 rounded-xl p-3 text-xs text-ink outline-none focus:border-gold resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>

            {/* 5. Optional Attachment */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Attach Photo / Proof (Optional)
              </label>
              <div className="border-2 border-dashed border-navy-900/10 rounded-xl p-4 text-center bg-paper hover:border-gold cursor-pointer transition-colors">
                <UploadCloud className="w-6 h-6 text-mist mx-auto mb-1" />
                <p className="text-xs text-ink font-medium">Click to upload photo or video</p>
                <p className="text-[10px] text-mist mt-0.5">PNG, JPG or MP4 up to 10MB</p>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={!selectedWarranty || isExpired || isSubmitting || !description.trim()}
              className="w-full bg-gold hover:opacity-95 text-navy-950 font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-navy-950" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <span>Submit Warranty Claim Ticket</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}