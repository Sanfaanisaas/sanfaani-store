"use client";

import { useMemo, useState, useEffect } from "react";
import { Wrench, Loader2 } from "lucide-react";

import RepairFilters from "@/components/RepairFilter";
import RepairTable from "@/components/RepairTable";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import axiosInstance from "@/lib/api/axiosInstance";

export default function RepairPage() {
  const [repairs, setRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");

  useEffect(() => {
    const fetchRepairs = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/repairs/queue");
        const result = response.data;
        if (result.success) {
          setRepairs(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch repairs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRepairs();
  }, []);

  const filteredRepairs = useMemo(() => {
    return repairs.filter((repair) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        (repair.id || repair._id || "").toLowerCase().includes(searchTerm) ||
        (repair.customer?.name || "").toLowerCase().includes(searchTerm) ||
        (repair.device?.model || "").toLowerCase().includes(searchTerm) ||
        (repair.issueDescription || "").toLowerCase().includes(searchTerm);

      const matchesStatus =
        status === "All" || repair.status === status;

      // Priority isn't in current repair schema but we'll leave filter for future compatibility
      const matchesPriority =
        priority === "All" || repair.priority === priority;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [repairs, search, status, priority]);

  return (
    <>
     <Navbar />
    <main className="min-h-screen bg-paper p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-navy-900">
              Repair Queue
            </h1>

            <p className="mt-1 text-mist">
              Manage customer repair requests and monitor their progress.
            </p>
          </div>
        </div>

        {/* Filters */}
        <RepairFilters
          search={search}
          status={status}
          priority={priority}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onPriorityChange={setPriority}
        />

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-navy-900/10 text-mist">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading repair queue...</p>
          </div>
        ) : (
          <RepairTable repairs={filteredRepairs} />
        )}
      </div>
    </main>
    <Footer />
     </>
  );
}
