"use client";

import React, { useState, useRef } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  UploadCloud, 
  ArrowLeft,
  X,
  FileText,
  Image as ImageIcon
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
  status: string;
  initialMessage: string;
  attachmentsCount: number;
  createdAt: string;
}

// Mock database records
const MOCK_WARRANTIES: WarrantyRecord[] = [
  {
    _id: "66a98f12c8230911a2",
    repair: "66b10298a4112001c1",
    customer: "66a01092b3121009e5",
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

interface AttachmentFile {
  file: File;
  previewUrl: string | null;
}

export default function WarrantyClaimPage() {
  const [warranties] = useState<WarrantyRecord[]>(MOCK_WARRANTIES);
  
  // Form Input States
  const [selectedWarrantyId, setSelectedWarrantyId] = useState<string>("");
  const [issueCategory, setIssueCategory] = useState<string>("DEFECT");
  const [description, setDescription] = useState<string>("");

  // File Upload State
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Handle File Change
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const files = Array.from(e.target.files || []);

    const validFiles: AttachmentFile[] = [];
    const MAX_SIZE_MB = 10;

    for (const file of files) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setFileError(`File "${file.name}" exceeds the ${MAX_SIZE_MB}MB size limit.`);
        continue;
      }

      // Generate preview for image files
      const isImage = file.type.startsWith("image/");
      const previewUrl = isImage ? URL.createObjectURL(file) : null;

      validFiles.push({ file, previewUrl });
    }

    setAttachments((prev) => [...prev, ...validFiles]);
    // Reset file input so re-uploading the same file works
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachments((prev) => {
      const target = prev[indexToRemove];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarranty || isExpired) return;

    setIsSubmitting(true);

    // If sending via FormData (for file uploads to API):
    const formData = new FormData();
    formData.append("customer", selectedWarranty.customer);
    formData.append("subject", `[Warranty Claim] ${selectedWarranty.deviceSummary} (${issueCategory})`);
    formData.append("relatedRepair", selectedWarranty.repair);
    formData.append("description", description);

    attachments.forEach((att) => {
      formData.append("attachments", att.file);
    });

    // Logging payload structure
    console.log("Submitting Warranty Claim FormData:", {
      customer: selectedWarranty.customer,
      subject: `[Warranty Claim] ${selectedWarranty.deviceSummary} (${issueCategory})`,
      relatedRepair: selectedWarranty.repair,
      description,
      filesCount: attachments.length,
      fileNames: attachments.map((a) => a.file.name),
    });

    // Simulate API Delay
    setTimeout(() => {
      setIsSubmitting(false);
      setCreatedTicket({
        ticketId: `TCK-${Math.floor(100000 + Math.random() * 900000)}`,
        customer: selectedWarranty.customer,
        subject: `[Warranty Claim] ${selectedWarranty.deviceSummary} (${issueCategory})`,
        relatedRepair: selectedWarranty.repair,
        status: "OPEN",
        initialMessage: description,
        attachmentsCount: attachments.length,
        createdAt: new Date().toLocaleString(),
      });
    }, 1200);
  };

  const handleReset = () => {
    // Revoke any generated previews
    attachments.forEach((att) => {
      if (att.previewUrl) URL.revokeObjectURL(att.previewUrl);
    });
    setAttachments([]);
    setCreatedTicket(null);
    setSelectedWarrantyId("");
    setDescription("");
    setFileError(null);
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
              <div className="flex justify-between items-center border-b border-navy-900/10 pb-2">
                <span className="text-mist font-medium">Attached Proofs:</span>
                <span className="font-semibold text-ink">{createdTicket.attachmentsCount} File(s)</span>
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

            {/* 5. Working File Attachment Component */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Attach Photo / Proof (Optional)
              </label>
              
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp, video/mp4"
                onChange={handleFileSelect}
                disabled={!selectedWarranty || isExpired}
                className="hidden"
              />

              {/* Clickable Dropzone Box */}
              <div 
                onClick={() => {
                  if (selectedWarranty && !isExpired) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                  !selectedWarranty || isExpired
                    ? "opacity-50 cursor-not-allowed bg-slate-100 border-navy-900/10"
                    : "bg-paper hover:border-gold border-navy-900/15 cursor-pointer"
                }`}
              >
                <UploadCloud className="w-6 h-6 text-mist mx-auto mb-1" />
                <p className="text-xs text-ink font-medium">
                  Click to upload photos or videos
                </p>
                <p className="text-[10px] text-mist mt-0.5">
                  PNG, JPG, WEBP, or MP4 up to 10MB each
                </p>
              </div>

              {/* Validation Error Message */}
              {fileError && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {fileError}
                </p>
              )}

              {/* Selected Files List & Preview Badges */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] font-bold text-mist uppercase tracking-wide">
                    Attached Files ({attachments.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attachments.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-paper border border-navy-900/10 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {item.previewUrl ? (
                            <img
                              src={item.previewUrl}
                              alt="preview"
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-navy-900/10"
                            />
                          ) : item.file.type.startsWith("image/") ? (
                            <ImageIcon className="w-4 h-4 text-navy-900 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-navy-900 shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="font-semibold text-ink truncate text-[11px]">
                              {item.file.name}
                            </p>
                            <p className="text-[10px] text-mist">
                              {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="p-1 rounded-lg hover:bg-rose-100 text-mist hover:text-rose-600 transition-colors shrink-0 ml-1"
                          title="Remove file"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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