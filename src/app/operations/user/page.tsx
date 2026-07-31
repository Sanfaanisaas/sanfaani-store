"use client";

import React, { useState } from "react";
import Sidebar from "@/components/sidebar";
import { logoutRequest } from "@/lib/api/authApi";
import Link from "next/link";
import { 
  ShoppingBag, Clock, CheckCircle2, 
  Search, ArrowRight, Menu, X, CreditCard
} from "lucide-react";

const USER_MOBILE_LINKS = [
  { label: "My Orders", icon: ShoppingBag, active: true },
];

const MOCK_ORDERS = [
  {
    id: "ORD-2026-8841",
    date: "28 Jul 2026",
    item: "OLED Display Assembly (iPhone 13)",
    status: "DELIVERED",
    total: "129.99",
  },
  {
    id: "REP-2026-3021",
    date: "25 Jul 2026",
    item: "Logic Board Diagnostic & Solder",
    status: "IN_PROGRESS",
    total: "85.00",
  },
];

export default function UserDashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOrders = MOCK_ORDERS.filter(
    (order) =>
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-ink">
      
      {/* Your Exact Sidebar Component */}
      <Sidebar title="User Account"  sidebarLinks={USER_MOBILE_LINKS} onLogout={logoutRequest}/>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Top Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-navy-900 text-white border-b border-navy-900/10">
          <p className="text-base font-bold">My Account</p>
          <button 
            type="button" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-mist hover:text-white"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-navy-900 text-white p-4 space-y-2 border-b border-navy-900/10">
            {USER_MOBILE_LINKS.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                type="button"
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active ? "bg-paper text-gold" : "text-mist hover:bg-paper hover:text-ink"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-navy-900/10 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold bg-paper border border-navy-900/10 px-2.5 py-1 rounded-md">
                Customer Account
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-ink mt-2">My Orders</h1>
              <p className="text-xs text-mist mt-0.5">Track live shipments and order history</p>
            </div>

            <Link href="/shop">
              <button
                type="button"
                className="bg-gold hover:bg-gold/90 text-navy-900 text-xs font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>Browse Products</span>
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-mist absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by reference ID or item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-paper border border-navy-900/10 rounded-xl pl-10 pr-4 py-3 text-xs text-ink focus:outline-none focus:border-gold"
            />
          </div>

          {/* Responsive Orders List */}
          <div className="bg-white border border-navy-900/10 rounded-2xl shadow-sm overflow-hidden">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-paper border-b border-navy-900/10 text-mist font-semibold">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Item Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/10">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-paper/50 transition">
                      <td className="p-4 font-mono font-bold text-ink">{ord.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-ink">{ord.item}</div>
                        <div className="text-[11px] text-mist">{ord.date}</div>
                      </td>
                      <td className="p-4">
                        {ord.status === "DELIVERED" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={12} /> Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                            <Clock size={12} /> Processing
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-ink">{ord.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-navy-900/10">
              {filteredOrders.map((ord) => (
                <div key={ord.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-ink">{ord.id}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {ord.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">{ord.item}</h4>
                    <p className="text-[11px] text-mist">{ord.date}</p>
                  </div>
                  <div className="pt-2 border-t border-navy-900/10 text-xs font-bold text-ink">
                    Total: {ord.total}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}