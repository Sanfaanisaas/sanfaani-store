"use client";

import React from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

interface PolicyLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function PolicyLayout({ title, subtitle, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-navy-900">
            <ShieldCheck className="w-5 h-5 text-gold" />
            <span className="text-xs font-bold uppercase tracking-wider">Legal & Store Policies</span>
          </div>
          <button 
            type="button" 
            onClick={() => window.history.back()}
            className="text-xs font-semibold text-ink hover:text-navy-900 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-navy-900/10 shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        {/* Page Card */}
        <div className="bg-white border border-navy-900/10 rounded-2xl p-6 md:p-10 shadow-sm space-y-6">
          <header className="border-b border-navy-900/10 pb-5">
            <h1 className="text-2xl font-bold text-ink">{title}</h1>
            <p className="text-xs text-mist mt-1">{subtitle}</p>
            <div className="mt-3 inline-block bg-paper border border-navy-900/10 px-2.5 py-1 rounded-md text-[11px] font-mono text-mist">
              Last Updated: {lastUpdated}
            </div>
          </header>
          
          <div className="text-xs text-ink leading-relaxed space-y-6">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}