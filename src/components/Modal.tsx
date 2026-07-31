"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => Promise<void> | void; // Developer-provided submission function
  submitText?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Save",
}: ModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    try {
      setIsSubmitting(true);
      await onSubmit(); // Execute developer-provided logic (API call, state update, etc.)
      onClose(); // Automatically close on success
    } catch (error) {
      console.error("Modal submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Darkened Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl border border-navy-900/10 transition-all text-ink z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-navy-900/10 pb-3">
          <h3 className="text-base font-bold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-mist hover:text-ink hover:bg-paper transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Wrap if onSubmit is provided */}
        {onSubmit ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>{children}</div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-navy-900/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-mist hover:bg-paper transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gold hover:bg-gold/90 text-navy-900 text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                {submitText}
              </button>
            </div>
          </form>
        ) : (
          <div>{children}</div>
        )}
      </div>
    </div>
  );
}