"use client";

import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CreditCard,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const summaryMetrics = [
  {
    label: "Gross Revenue",
    value: "₦18,450,000",
    trend: "up",
    icon: Banknote,
  },
  {
    label: "Net Profit",
    value: "₦6,720,000",
    trend: "up",
    icon: TrendingUp,
  },
  {
    label: "Pending Payouts",
    value: "₦1,280,000",
    trend: "down",
    icon: WalletCards,
  },
  {
    label: "Refunds",
    value: "₦215,500",
    trend: "down",
    icon: CreditCard,
  },
] as const;

const revenueStreams = [
  { label: "Device Sales", amount: "₦11,900,000", value: 11900000, share: "64%", color: "#b8892b" },
  { label: "Repair Services", amount: "₦4,250,000", value: 4250000, share: "23%", color: "#2f5fa6" },
  { label: "Accessories", amount: "₦1,540,000", value: 1540000, share: "8%", color: "#10b981" },
  { label: "Warranty Plans", amount: "₦760,000", value: 760000, share: "5%", color: "#f43f5e" },
];

const recentTransactions = [
  { id: "SNF-2048", customer: "James Noah", type: "MacBook Pro Repair", amount: "₦185,000", status: "Paid" },
  { id: "SNF-2047", customer: "Rina Bello", type: "iPhone 14 Pro", amount: "₦1,250,000", status: "Paid" },
  { id: "SNF-2046", customer: "Neo Carter", type: "Battery Replacement", amount: "₦52,000", status: "Pending" },
  { id: "SNF-2045", customer: "Lara Stone", type: "USB-C Hub", amount: "₦38,500", status: "Refunded" },
];

const revenueChartData: ChartData<"pie"> = {
  labels: revenueStreams.map((stream) => stream.label),
  datasets: [
    {
      data: revenueStreams.map((stream) => stream.value),
      backgroundColor: revenueStreams.map((stream) => stream.color),
      borderColor: "#ffffff",
      borderWidth: 4,
      hoverBorderColor: "#faf9f6",
      hoverOffset: 8,
    },
  ],
};

const revenueChartOptions: ChartOptions<"pie"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const stream = revenueStreams[context.dataIndex];
          return `${stream.label}: ${stream.amount} (${stream.share})`;
        },
      },
    },
  },
};

export default function FinancialMetrics() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-navy-900/10 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink">Financial Metrics</h1>
          <p className="text-xs text-mist mt-0.5">
            Track revenue, payouts, refunds, and transaction performance.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-navy-900/10 bg-paper px-3 py-2 text-xs font-semibold text-mist">
          <ReceiptText size={16} className="text-gold" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryMetrics.map(({ label, value, change, trend, icon: Icon }) => {
          const isPositive = trend === "up";

          return (
            <section key={label} className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper text-navy-900">
                  <Icon size={18} />
                </div>
              </div>
              <p className="mt-5 text-xs font-medium text-mist">{label}</p>
              <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
            </section>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Revenue Streams</h2>
            <span className="text-xs font-semibold text-mist">Total ₦18.45M</span>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-[220px_1fr] xl:grid-cols-1 2xl:grid-cols-[220px_1fr]">
            <div className="mx-auto h-[220px] w-full max-w-[220px]">
              <Pie data={revenueChartData} options={revenueChartOptions} />
            </div>

            <div className="space-y-3 self-center">
            {revenueStreams.map((stream) => (
              <div
                key={stream.label}
                className="flex items-center justify-between gap-4 rounded-xl border border-navy-900/10 bg-paper px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: stream.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-ink">{stream.label}</p>
                    <p className="text-[11px] font-medium text-mist">{stream.share} of monthly revenue</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-extrabold text-ink">{stream.amount}</span>
              </div>
            ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-navy-900/10 bg-paper px-6 py-4">
            <h2 className="text-base font-bold text-ink">Recent Transactions</h2>
            <span className="text-xs font-semibold text-mist">Latest 4</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="border-b border-navy-900/10 text-mist">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900/10">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-paper/50 transition">
                    <td className="p-4 font-bold text-ink">{transaction.id}</td>
                    <td className="p-4 font-medium text-ink">{transaction.customer}</td>
                    <td className="p-4 text-mist">{transaction.type}</td>
                    <td className="p-4 font-bold text-ink">{transaction.amount}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                          transaction.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : transaction.status === "Pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
