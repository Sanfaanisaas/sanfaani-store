"use client";

import {
  Activity,
  CheckCircle2,
  CloudUpload,
  DatabaseBackup,
  KeyRound,
  LockKeyhole,
  ServerCog,
  ShieldCheck,
  TriangleAlert,
  UserCog,
} from "lucide-react";

const backupJobs = [
  {
    name: "Store database",
    schedule: "Every 6 hours",
    retention: "30 days",
    status: "Healthy",
    lastRun: "Today, 02:00",
  },
  {
    name: "Product media",
    schedule: "Daily",
    retention: "90 days",
    status: "Running",
    lastRun: "Today, 01:15",
  },
  {
    name: "Repair documents",
    schedule: "Daily",
    retention: "60 days",
    status: "Healthy",
    lastRun: "Yesterday, 23:40",
  },
] as const;

const monitoringServices = [
  { label: "API availability", value: "99.98%", state: "Operational" },
  { label: "Checkout latency", value: "182 ms", state: "Stable" },
  { label: "Error rate", value: "0.04%", state: "Low" },
  { label: "Queue depth", value: "12 jobs", state: "Normal" },
];

const accessRequests = [
  {
    person: "Mitsuki Tan",
    role: "Repair technician",
    access: "Diagnostics dashboard",
    status: "Approved",
  },
  {
    person: "Postman Admin",
    role: "Operations admin",
    access: "Backup restore tools",
    status: "Review",
  },
  {
    person: "Lara Stone",
    role: "Support lead",
    access: "Customer device notes",
    status: "Approved",
  },
] as const;

const statusTone = {
  Healthy: "bg-emerald-50 text-emerald-700",
  Running: "bg-sky-50 text-sky-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Review: "bg-amber-50 text-amber-700",
} as const;

export default function TechnicalOperations() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-navy-900/10 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">Technical Operations</h1>
          <p className="mt-0.5 text-xs text-mist">
            Manage backup health, platform monitoring, and privileged access.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
          <ShieldCheck size={16} />
          Systems protected
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm">
          <DatabaseBackup className="text-gold" size={20} />
          <p className="mt-5 text-xs font-medium text-mist">Backup Coverage</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">3/3 Jobs</p>
        </section>
        <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm">
          <Activity className="text-emerald-600" size={20} />
          <p className="mt-5 text-xs font-medium text-mist">Service Uptime</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">99.98%</p>
        </section>
        <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm">
          <KeyRound className="text-navy-900" size={20} />
          <p className="mt-5 text-xs font-medium text-mist">Privileged Users</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">7 Active</p>
        </section>
        <section className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm">
          <TriangleAlert className="text-amber-600" size={20} />
          <p className="mt-5 text-xs font-medium text-mist">Open Incidents</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">1 Review</p>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-navy-900/10 bg-paper px-6 py-4">
            <div className="flex items-center gap-2">
              <CloudUpload size={18} className="text-gold" />
              <h2 className="text-base font-bold text-ink">Backup Management</h2>
            </div>
            <span className="text-xs font-semibold text-mist">Automated</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="border-b border-navy-900/10 text-mist">
                <tr>
                  <th className="p-4">Asset</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Retention</th>
                  <th className="p-4">Last Run</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900/10">
                {backupJobs.map((job) => (
                  <tr key={job.name} className="transition hover:bg-paper/50">
                    <td className="p-4 font-bold text-ink">{job.name}</td>
                    <td className="p-4 text-mist">{job.schedule}</td>
                    <td className="p-4 text-mist">{job.retention}</td>
                    <td className="p-4 font-medium text-ink">{job.lastRun}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusTone[job.status]}`}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ServerCog size={18} className="text-navy-900" />
            <h2 className="text-base font-bold text-ink">Monitoring</h2>
          </div>
          <div className="mt-5 space-y-3">
            {monitoringServices.map((service) => (
              <div
                key={service.label}
                className="flex items-center justify-between gap-4 rounded-xl border border-navy-900/10 bg-paper px-4 py-3"
              >
                <div>
                  <p className="text-xs font-bold text-ink">{service.label}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-mist">{service.state}</p>
                </div>
                <span className="text-sm font-extrabold text-ink">{service.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-navy-900/10 bg-paper px-6 py-4">
          <div className="flex items-center gap-2">
            <LockKeyhole size={18} className="text-gold" />
            <h2 className="text-base font-bold text-ink">Technical Access</h2>
          </div>
          <span className="text-xs font-semibold text-mist">Least privilege</span>
        </div>
        <div className="grid grid-cols-1 divide-y divide-navy-900/10 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {accessRequests.map((request) => (
            <article key={`${request.person}-${request.access}`} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <UserCog size={18} className="mt-0.5 text-navy-900" />
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusTone[request.status]}`}>
                  {request.status}
                </span>
              </div>
              <p className="mt-4 text-sm font-bold text-ink">{request.person}</p>
              <p className="mt-1 text-xs text-mist">{request.role}</p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-paper px-3 py-2 text-xs font-semibold text-ink">
                <CheckCircle2 size={14} className="text-emerald-600" />
                {request.access}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
