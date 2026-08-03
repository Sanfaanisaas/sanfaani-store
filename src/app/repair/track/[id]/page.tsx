"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { InternalRepairStatus } from "./utils/statusMapper";
import StatusBanner from "@/components/statusBanner";
import RepairTimeline from "@/components/repairTimeline";
import QuoteApprovalCard, {
  Quote,
} from "@/components/quoteApprovalCard";

interface RepairData {
  id: string;
  deviceName: string;
  serialNumber?: string;
  customerName?: string;
  status: InternalRepairStatus;
  updatedAt: string;
  quote?: Quote | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

function getErrorMessage(
    error: unknown,
    fallback: string,
): string {
  return error instanceof Error && error.message
      ? error.message
      : fallback;
}

export default function RepairTrackingPage() {
  const params = useParams();
  const repairId = (params?.id as string) || "REP-9082";

  const [repair, setRepair] =
      useState<RepairData | null>(null);
  const [loading, setLoading] =
      useState<boolean>(true);
  const [error, setError] =
      useState<string | null>(null);

  const loadRealData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
          `/api/repairs/${repairId}/track`,
      );

      const result =
          (await response.json()) as ApiResponse<RepairData>;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
            result.message || "Repair record unavailable.",
        );
      }

      setRepair(result.data);
    } catch (requestError: unknown) {
      setRepair(null);
      setError(
          getErrorMessage(
              requestError,
              "Failed to load repair details.",
          ),
      );
    } finally {
      setLoading(false);
    }
  }, [repairId]);

  useEffect(() => {
    void loadRealData();
  }, [loadRealData]);

  const handleApproveQuote = async (
      quoteVersion: number,
  ) => {
    try {
      const response = await fetch(
          `/api/repairs/${repairId}/quote/${quoteVersion}/approve`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
          },
      );

      const result =
          (await response.json()) as ApiResponse<unknown>;

      if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Failed to approve quote.",
        );
      }

      await loadRealData();
    } catch (approvalError: unknown) {
      console.error("Approval error:", approvalError);

      alert(
          getErrorMessage(
              approvalError,
              "An unexpected error occurred during approval.",
          ),
      );
    }
  };

  const handleDeclineQuote = async (
      quoteVersion: number,
      reason?: string,
  ) => {
    try {
      const response = await fetch(
          `/api/repairs/${repairId}/quote/${quoteVersion}/decline`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ reason }),
          },
      );

      const result =
          (await response.json()) as ApiResponse<unknown>;

      if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Failed to decline quote.",
        );
      }

      await loadRealData();
    } catch (declineError: unknown) {
      console.error("Decline error:", declineError);

      alert(
          getErrorMessage(
              declineError,
              "An unexpected error occurred.",
          ),
      );
    }
  };

  if (loading) {
    return (
        <main className="min-h-[60vh] flex flex-col items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-navy-900 mb-3" />

          <p className="text-sm font-medium text-mist">
            Loading repair details...
          </p>
        </main>
    );
  }

  if (error || !repair) {
    return (
        <main className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-900 shadow-sm space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />

            <div>
              <h2 className="text-lg font-bold">
                Tracking Error
              </h2>

              <p className="text-xs text-rose-700 mt-1">
                {error || "Repair record unavailable."}
              </p>
            </div>

            <button
                type="button"
                onClick={() => void loadRealData()}
                className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        </main>
    );
  }

  return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <StatusBanner
            repairId={repair.id}
            deviceName={repair.deviceName}
            serialNumber={repair.serialNumber}
            customerName={repair.customerName}
        />

        <RepairTimeline
            currentStatus={repair.status}
            updatedAt={repair.updatedAt}
        />

        <QuoteApprovalCard
            repairId={repair.id}
            quote={repair.quote}
            onApprove={handleApproveQuote}
            onDecline={handleDeclineQuote}
        />
      </main>
  );
}