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

// Interface matching your Mongoose Warranty Schema
export interface WarrantyRecord {
  _id: string;
  repair: string; // ObjectId reference to Repair
  customer: string;
  deviceSummary: string;
  issuedAt: string;
  expiresAt: string;
}

// Mock database records matching your Mongoose Schema
const MOCK_WARRANTIES: WarrantyRecord[] = [
  {
    _id: "66a98f12c8230911a2",
    repair: "REP-9082",
    customer: "USR-101",
    deviceSummary: "iPhone 13 Pro - OLED Screen & Glass Replacement",
    issuedAt: "2026-06-15T08:00:00.000Z",
    expiresAt: "2026-09-15T08:00:00.000Z", // Active
  },
  {
    _id: "66a98f12c8230911a3",
    repair: "REP-8411",
    customer: "USR-101",
    deviceSummary: "Samsung Galaxy S22 - Battery Replacement",
    issuedAt: "2026-05-01T08:00:00.000Z",
    expiresAt: "2026-08-01T08:00:00.000Z", // Active
  },
  {
    _id: "66a98f12c8230911a4",
    repair: "REP-7102",
    customer: "USR-101",
    deviceSummary: "MacBook Pro 14\" - Charging Port Soldering",
    issuedAt: "2026-01-10T08:00:00.000Z",
    expiresAt: "2026-04-10T08:00:00.000Z", // Expired
  },
];

export default function WarrantyClaimMockPage() {
  // State
  const [warranties] = useState<WarrantyRecord[]>(MOCK_WARRANTIES);
  const [selectedId, setSelectedId] = useState<string>("");
  const [issueCategory, setIssueCategory] = useState<string>("DEFECT");
  const [description, setDescription] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdClaim, setCreatedClaim] = useState<{
    claimId: string;
    warranty: WarrantyRecord;
    description: string;
    date: string;
  } | null>(null);

  // Active warranty selection lookup
  const selectedWarranty = warranties.find((w) => w._id === selectedId) || null;

  // Expiration calculation helper
  const getDaysRemaining = (expiresAt: string) => {
    const diffTime = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isExpired = selectedWarranty ? getDaysRemaining(selectedWarranty.expiresAt) <= 0 : false;

  // Mock Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarranty || isExpired) return;

    setIsSubmitting(true);

    // Simulate network latency
    setTimeout(() => {
      setIsSubmitting(false);
      setCreatedClaim({
        claimId: `CLM-${Math.floor(100000 + Math.random() * 900000)}`,
        warranty: selectedWarranty,
        description,
        date: new Date().toLocaleString(),
      });
    }, 1200);
  };

  // Reset form
  const handleReset = () => {
    setCreatedClaim(null);
    setSelectedId("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Submit Warranty Claim</h1>
            <p className="text-xs text-mist mt-1">
              Select an eligible repair covered by our 90-day guarantee policy.
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

        {/* --- VIEW: SUCCESS RECAP --- */}
        {createdClaim ? (
          <div className="bg-white border border-navy-900/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold font-mono tracking-wider text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full uppercase border border-amber-200">
                Claim Created • {createdClaim.claimId}
              </span>
              <h2 className="text-xl font-bold text-ink pt-2">Warranty Claim Submitted</h2>
              <p className="text-xs text-mist max-w-sm mx-auto">
                We have registered your request. Our repair technicians will review your original repair history and respond shortly.
              </p>
            </div>

            {/* Claim Summary Box */}
            <div className="bg-paper border border-navy-900/10 rounded-xl p-4 text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-navy-900/10 pb-2">
                <span className="text-mist font-medium">Device / Repair:</span>
                <span className="font-semibold text-ink text-right">{createdClaim.warranty.deviceSummary}</span>
              </div>
              <div className="flex justify-between items-center border-b border-navy-900/10 pb-2">
                <span className="text-mist font-medium">Original Repair Reference:</span>
                <span className="font-mono font-bold text-navy-900">{createdClaim.warranty.repair}</span>
              </div>
              <div className="flex justify-between items-center border-b border-navy-900/10 pb-2">
                <span className="text-mist font-medium">Submitted On:</span>
                <span className="text-ink">{createdClaim.date}</span>
              </div>
              <div>
                <span className="text-mist font-medium block mb-1">Issue Description:</span>
                <p className="text-ink italic bg-white p-2.5 rounded border border-navy-900/10 text-xs">
                  "{createdClaim.description}"
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
            
            {/* 1. Device Selection from Warranty Schema */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Select Covered Device / Repair
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                required
                className="w-full bg-paper border border-navy-900/10 rounded-xl p-3 text-sm text-ink outline-none focus:border-gold transition-all cursor-pointer"
              >
                <option value="">-- Choose repair record --</option>
                {warranties.map((w) => {
                  const days = getDaysRemaining(w.expiresAt);
                  const expired = days <= 0;
                  return (
                    <option key={w._id} value={w._id}>
                      {w.deviceSummary} ({w.repair}) — {expired ? "EXPIRED" : `${days} Days Left`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 2. Status Card based on Selection */}
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
                    <span>This item is no longer covered under warranty. Please submit a standard repair request instead.</span>
                  </div>
                )}
              </div>
            )}

            {/* 3. Category Selector */}
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

            {/* 4. Problem Description */}
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
                    ? "Explain what malfunction occurred after the repair (e.g., touch screen stopped responding on top edge)..." 
                    : "Select a valid warranty above first..."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-paper border border-navy-900/10 rounded-xl p-3 text-xs text-ink outline-none focus:border-gold resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>

            {/* 5. File Upload */}
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
                  <span>Processing Claim...</span>
                </>
              ) : (
                <span>Submit Warranty Claim</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}