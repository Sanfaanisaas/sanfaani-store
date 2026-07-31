"use client";

import React, { useState } from "react";
import { Wrench, Copy, Check, Smartphone } from "lucide-react";

interface StatusBannerProps {
  repairId: string;
  deviceName: string;
  serialNumber?: string;
  customerName?: string;
}

export default function StatusBanner({
  repairId,
  deviceName,
  serialNumber,
  customerName,
}: StatusBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-navy-900 text-white rounded-xl p-6 shadow-md mb-6 relative overflow-hidden">
      {/* Background Accent Decorative Circle */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        {/* Left Side: Repair & Device Details */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-white/10 text-gold text-xs font-mono font-bold px-2.5 py-0.5 rounded border border-white/10">
              #{repairId}
            </span>
            {customerName && (
              <span className="text-mist text-xs">
                for <strong className="text-white">{customerName}</strong>
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-gold shrink-0" />
            <span>{deviceName}</span>
          </h1>

          {serialNumber && (
            <p className="text-xs text-mist font-mono">
              S/N: {serialNumber}
            </p>
          )}
        </div>

        {/* Right Side: Copy Tracking Link Button */}
        <div className="shrink-0 pt-2 md:pt-0 border-t border-white/10 md:border-none">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors border border-white/10"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-mist" />
                <span>Share Tracking Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}