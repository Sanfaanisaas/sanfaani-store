"use client";

import { useMemo, useState } from "react";
import { Wrench } from "lucide-react";

import RepairFilters from "@/components/RepairFilter";
import RepairTable from "@/components/RepairTable";
import { mockRepairs } from "@/lib/mockData/mockupRepair";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function RepairPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");

  const filteredRepairs = useMemo(() => {
    return mockRepairs.filter((repair) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        repair.id.toLowerCase().includes(searchTerm) ||
        repair.customer.toLowerCase().includes(searchTerm) ||
        repair.device.toLowerCase().includes(searchTerm) ||
        repair.issue.toLowerCase().includes(searchTerm);

      const matchesStatus =
        status === "All" || repair.status === status;

      const matchesPriority =
        priority === "All" || repair.priority === priority;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [search, status, priority]);

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
        <RepairTable repairs={filteredRepairs} />
      </div>
    </main>
    <Footer />
     </>
  );
}