"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Wrench,
} from "lucide-react";

import type {
  Repair,
  RepairPriority,
  RepairStatus,
} from "@/app/orders/repair/types";

import StatusBadge from "./StatusBadge";
import Modal from "./Modal";

interface RepairTableProps {
  repairs: Repair[];
  onUpdateRepair?: (updatedRepair: Repair) => void;
}

type RepairEditFormData = Pick<
    Repair,
    "status" | "priority" | "issue"
>;

const REPAIR_STATUSES: readonly RepairStatus[] = [
  "Received",
  "Diagnosing",
  "Waiting Approval",
  "Repairing",
  "Ready",
  "Delivered",
  "Cancelled",
];

const REPAIR_PRIORITIES: readonly RepairPriority[] = [
  "Low",
  "Medium",
  "High",
];

function isRepairStatus(
    value: string,
): value is RepairStatus {
  return REPAIR_STATUSES.some(
      (status) => status === value,
  );
}

function isRepairPriority(
    value: string,
): value is RepairPriority {
  return REPAIR_PRIORITIES.some(
      (priority) => priority === value,
  );
}

export default function RepairTable({
                                      repairs,
                                      onUpdateRepair,
                                    }: RepairTableProps) {
  const [repairList, setRepairList] =
      useState<Repair[]>(repairs);

  const [modalMode, setModalMode] =
      useState<"view" | "edit" | null>(null);

  const [selectedRepair, setSelectedRepair] =
      useState<Repair | null>(null);

  const [editFormData, setEditFormData] =
      useState<RepairEditFormData>({
        status: "Received",
        priority: "Medium",
        issue: "",
      });

  useEffect(() => {
    setRepairList(repairs);
  }, [repairs]);

  const handleOpenView = (repair: Repair) => {
    setSelectedRepair(repair);
    setModalMode("view");
  };

  const handleOpenEdit = (repair: Repair) => {
    setSelectedRepair(repair);

    setEditFormData({
      status: repair.status,
      priority: repair.priority,
      issue: repair.issue,
    });

    setModalMode("edit");
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedRepair(null);
  };

  const handleStatusChange = (value: string) => {
    if (!isRepairStatus(value)) {
      return;
    }

    setEditFormData((current) => ({
      ...current,
      status: value,
    }));
  };

  const handlePriorityChange = (value: string) => {
    if (!isRepairPriority(value)) {
      return;
    }

    setEditFormData((current) => ({
      ...current,
      priority: value,
    }));
  };

  const handleIssueChange = (value: string) => {
    setEditFormData((current) => ({
      ...current,
      issue: value,
    }));
  };

  const handleEditSubmit = async () => {
    if (!selectedRepair) {
      return;
    }

    const updated: Repair = {
      ...selectedRepair,
      status: editFormData.status,
      priority: editFormData.priority,
      issue: editFormData.issue,
    };

    onUpdateRepair?.(updated);

    setRepairList((current) =>
        current.map((repair) =>
            repair.id === selectedRepair.id
                ? updated
                : repair,
        ),
    );

    handleCloseModal();
  };

  if (repairList.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
          <div className="mb-4 rounded-full bg-paper p-4">
            <Wrench className="h-8 w-8 text-mist" />
          </div>

          <h3 className="text-base font-semibold text-navy-900">
            No repair requests found
          </h3>

          <p className="mt-2 text-sm text-mist">
            Try adjusting your search or filters.
          </p>
        </div>
    );
  }

  return (
      <>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-paper">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-mist">
                  Repair ID
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-mist">
                  Customer
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-mist">
                  Device
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-mist">
                  Issue
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-mist">
                  Priority
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-mist">
                  Status
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-mist">
                  Submitted
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-mist">
                  Actions
                </th>
              </tr>
              </thead>

              <tbody>
              {repairList.map((repair) => (
                  <tr
                      key={repair.id}
                      className="cursor-pointer border-b border-gray-100 transition hover:bg-paper"
                      onClick={() => handleOpenView(repair)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-navy-900">
                      {repair.id}
                    </td>

                    <td className="px-4 py-3 text-sm text-ink">
                      {repair.customer}
                    </td>

                    <td className="px-4 py-3 text-sm text-ink">
                      {repair.device}
                    </td>

                    <td className="max-w-[220px] truncate px-4 py-3 text-sm text-mist">
                      {repair.issue}
                    </td>

                    <td className="px-4 py-3">
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            repair.priority === "High"
                                ? "bg-red-100 text-red-700"
                                : repair.priority === "Medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                        }`}
                    >
                      {repair.priority}
                    </span>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={repair.status} />
                    </td>

                    <td className="px-4 py-3 text-sm text-mist">
                      {repair.submittedAt}
                    </td>

                    <td
                        className="px-4 py-3"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                      <div className="flex justify-end gap-1">
                        <button
                            type="button"
                            onClick={() =>
                                handleOpenView(repair)
                            }
                            className="rounded-md p-1.5 transition hover:bg-paper"
                            title="View Details"
                        >
                          <Eye
                              size={16}
                              className="text-navy-900"
                          />
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleOpenEdit(repair)
                            }
                            className="rounded-md p-1.5 transition hover:bg-paper"
                            title="Edit Request"
                        >
                          <Pencil
                              size={16}
                              className="text-gold"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <p className="text-xs text-mist">
              Showing{" "}
              <span className="font-medium text-ink">
              1-{repairList.length}
            </span>{" "}
              of{" "}
              <span className="font-medium text-ink">
              {repairList.length}
            </span>{" "}
              repairs
            </p>

            <div className="flex items-center gap-2">
              <button
                  type="button"
                  disabled
                  className="rounded-md border border-gray-300 p-1.5 text-xs text-ink transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                  type="button"
                  className="rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-white"
              >
                1
              </button>

              <button
                  type="button"
                  disabled
                  className="rounded-md border border-gray-300 p-1.5 text-xs text-ink transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <Modal
            isOpen={modalMode === "view"}
            onClose={handleCloseModal}
            title={`Repair Ticket Details (${selectedRepair?.id ?? ""})`}
        >
          {selectedRepair && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-navy-900/10 bg-paper p-3">
                  <div>
                <span className="block font-medium text-mist">
                  Customer
                </span>

                    <span className="font-bold text-navy-900">
                  {selectedRepair.customer}
                </span>
                  </div>

                  <div>
                <span className="block font-medium text-mist">
                  Device
                </span>

                    <span className="font-bold text-navy-900">
                  {selectedRepair.device}
                </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl border border-navy-900/10 bg-paper p-3">
                  <div>
                <span className="mb-1 block font-medium text-mist">
                  Status
                </span>

                    <StatusBadge
                        status={selectedRepair.status}
                    />
                  </div>

                  <div>
                <span className="block font-medium text-mist">
                  Priority
                </span>

                    <span className="font-semibold text-ink">
                  {selectedRepair.priority}
                </span>
                  </div>
                </div>

                <div className="space-y-1 rounded-xl border border-navy-900/10 bg-paper p-3">
              <span className="block font-medium text-mist">
                Issue Description
              </span>

                  <p className="leading-relaxed text-ink">
                    {selectedRepair.issue}
                  </p>
                </div>

                <div className="pt-1 text-right text-[11px] text-mist">
                  Submitted on: {selectedRepair.submittedAt}
                </div>
              </div>
          )}
        </Modal>

        <Modal
            isOpen={modalMode === "edit"}
            onClose={handleCloseModal}
            title={`Edit Repair Ticket #${selectedRepair?.id ?? ""}`}
            onSubmit={handleEditSubmit}
            submitText="Save Changes"
        >
          {selectedRepair && (
              <div className="space-y-4 text-xs">
                <div>
                  <label
                      htmlFor="repair-status"
                      className="mb-1 block font-semibold text-mist"
                  >
                    Status
                  </label>

                  <select
                      id="repair-status"
                      value={editFormData.status}
                      onChange={(event) =>
                          handleStatusChange(event.target.value)
                      }
                      className="w-full rounded-xl border border-navy-900/10 bg-paper px-3 py-2 text-ink focus:border-gold focus:outline-none"
                  >
                    {REPAIR_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                      htmlFor="repair-priority"
                      className="mb-1 block font-semibold text-mist"
                  >
                    Priority
                  </label>

                  <select
                      id="repair-priority"
                      value={editFormData.priority}
                      onChange={(event) =>
                          handlePriorityChange(
                              event.target.value,
                          )
                      }
                      className="w-full rounded-xl border border-navy-900/10 bg-paper px-3 py-2 text-ink focus:border-gold focus:outline-none"
                  >
                    {REPAIR_PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                      htmlFor="repair-issue"
                      className="mb-1 block font-semibold text-mist"
                  >
                    Issue Description
                  </label>

                  <textarea
                      id="repair-issue"
                      rows={3}
                      value={editFormData.issue}
                      onChange={(event) =>
                          handleIssueChange(event.target.value)
                      }
                      className="w-full resize-none rounded-xl border border-navy-900/10 bg-paper px-3 py-2 text-ink focus:border-gold focus:outline-none"
                  />
                </div>
              </div>
          )}
        </Modal>
      </>
  );
}