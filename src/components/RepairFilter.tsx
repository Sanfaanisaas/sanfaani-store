"use client";

import { Search } from "lucide-react";

interface RepairFiltersProps {
  search: string;
  status: string;
  priority: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
}

const statuses = [
  "All",
  "Received",
  "Diagnosing",
  "Waiting Approval",
  "Repairing",
  "Ready",
  "Delivered",
  "Cancelled",
];

const priorities = ["All", "High", "Medium", "Low"];

export default function RepairFilters({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
}: RepairFiltersProps) {
  return (
    <section className="mb-6  p-5 ">
      <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-mist"
            size={18}
          />

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search repair ID, customer or device..."
            className="
              w-full
              rounded-lg
              border
              border-gray-300
              bg-paper
              py-3
              pl-11
              pr-4
              text-ink
              outline-none
              transition
              focus:border-gold
              focus:ring-2
              focus:ring-gold/30
            "
          />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="
            rounded-lg
            border
            border-gray-300
            bg-paper
            px-4
            py-3
            text-ink
            outline-none
            focus:border-gold
            focus:ring-2
            focus:ring-gold/30
          "
        >
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="
            rounded-lg
            border
            border-gray-300
            bg-paper
            px-4
            py-3
            text-ink
            outline-none
            focus:border-gold
            focus:ring-2
            focus:ring-gold/30
          "
        >
          {priorities.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
    </section>
  );
}