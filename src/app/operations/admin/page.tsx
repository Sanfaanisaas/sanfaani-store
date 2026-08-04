"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/sidebar";
import { logoutRequest } from "@/lib/api/authApi";
import { Package, Users, Menu, X, CreditCard } from "lucide-react";
import InverntoryCrud from "@/components/InventroyCRUD";
import UserDirectory from "@/components/userDirectory";
import FinancialMetrics from "@/components/FinancialMetrics";

type AdminPage = "Inventory CRUD" | "User Directory" | "Financial Metrics";

const ADMIN_NAV_ITEMS = [
  { label: "Inventory CRUD", icon: Package },
  { label: "User Directory", icon: Users },
  { label: "Financial Metrics", icon: CreditCard },
] satisfies Array<{ label: AdminPage; icon: typeof Package }>;

export default function AdminDashboardPage(){
  const [page,setPage] = useState<AdminPage>("Inventory CRUD")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminLinks = useMemo(
    () =>
      ADMIN_NAV_ITEMS.map((item) => ({
        ...item,
        active: page === item.label,
        onClick: () => {
          setPage(item.label);
          setIsMobileMenuOpen(false);
        },
      })),
    [page]
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-ink">
      <Sidebar title="Admin Account" sidebarLinks={adminLinks} onLogout={logoutRequest} />
      <div className="flex-1 flex flex-col min-w-0">
            <header className="lg:hidden flex items-center justify-between p-4 bg-navy-900 text-white border-b border-navy-900/10">
          <p className="text-base font-bold">Admin Panel</p>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-mist hover:text-white"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-navy-900 text-white p-4 space-y-2 border-b border-navy-900/10">
            {adminLinks.map(({ label, icon: Icon, active, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active ? "bg-paper text-gold" : "text-mist hover:bg-paper hover:text-ink"
                  }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        )}
        {page === "Inventory CRUD" && <InverntoryCrud />}
        {page === "User Directory" && <UserDirectory /> }
        {page === "Financial Metrics" && <FinancialMetrics /> }
        </div>

      
    </div>
  );
}
