"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

import { InternalRepairStatus } from "./utils/statusMapper";
import StatusBanner from "@/components/statusBanner";
import RepairTimeline from "@/components/repairTimeline"; // Fixed import path
import QuoteApprovalCard, { Quote } from "@/components/quoteApprovalCard";

interface RepairData {
  id: string;
  deviceName: string;
  serialNumber?: string;
  customerName?: string;
  status: InternalRepairStatus;
  updatedAt: string;
  quote?: Quote | null;
}

// Inside app/repair/track/[id]/page.tsx
const MOCK_REPAIR_DATA: RepairData = {
  id: "REP-9082",
  deviceName: "iPhone 13 Pro",
  serialNumber: "DNXF8900PM12",
  customerName: "Alex Morgan",
  status: "QUOTE_PENDING",
  updatedAt: new Date().toISOString(),
  quote: {
    version: 1,
    status: "PENDING",
    currency: "NAIRA",
    laborCost: 45000,
    tax: 0,
    discount: 5000,
    totalAmount: 140000, // Changed key from totalCost to totalAmount
    notes: "Screen replacement includes a 90-day warranty on parts and labor.",
    items: [
      {
        id: "item-1",
        description: "OLED Screen Assembly (Grade A OEM)",
        quantity: 1,
        amount: 95000,
      },
    ],
  },
};


export default function RepairTrackingPage() {
  const params = useParams();
  const repairId = (params?.id as string) || "REP-9082";

  const [repair, setRepair] = useState<RepairData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching data with a small timeout
  const loadMockData = () => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      // Simulate success with mock data
      setRepair({
        ...MOCK_REPAIR_DATA,
        id: repairId, // retain route ID
      });
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    loadMockData();
  }, [repairId]);

  // Handler for Quote Approval (Mocked)
  const handleApproveQuote = async (quoteVersion: number) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    setRepair((prev) => {
      if (!prev || !prev.quote) return prev;
      return {
        ...prev,
        status: "IN_REPAIR",
        updatedAt: new Date().toISOString(),
        quote: {
          ...prev.quote,
          status: "APPROVED",
        },
      };
    });
  };

  // Handler for Quote Decline (Mocked)
  const handleDeclineQuote = async (quoteVersion: number, reason?: string) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    setRepair((prev) => {
      if (!prev || !prev.quote) return prev;
      return {
        ...prev,
        status: "CANCELLED",
        updatedAt: new Date().toISOString(),
        quote: {
          ...prev.quote,
          status: "DECLINED",
        },
      };
    });
  };

  // 1. Loading State
  if (loading) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-navy-900 mb-3" />
        <p className="text-sm font-medium text-mist">Loading repair details...</p>
      </main>
    );
  }

  // 2. Error State
  if (error || !repair) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-900 shadow-sm space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <div>
            <h2 className="text-lg font-bold">Tracking Error</h2>
            <p className="text-xs text-rose-700 mt-1">{error || "Repair record unavailable."}</p>
          </div>
          <button
            type="button"
            onClick={loadMockData}
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </main>
    );
  }

  // 3. Main Tracking Interface
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Banner */}
      <StatusBanner
        repairId={repair.id}
        deviceName={repair.deviceName}
        serialNumber={repair.serialNumber}
        customerName={repair.customerName}
      />

      {/* Step-by-Step Status Timeline */}
      <RepairTimeline
        currentStatus={repair.status}
        updatedAt={repair.updatedAt}
      />

      {/* Quote Approval Breakdown */}
      <QuoteApprovalCard
        repairId={repair.id}
        quote={repair.quote}
        onApprove={handleApproveQuote}
        onDecline={handleDeclineQuote}
      />
    </main>
  );
}