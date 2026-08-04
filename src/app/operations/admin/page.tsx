"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import { logoutRequest } from "@/lib/api/authApi";
import Modal from "@/components/Modal";
import {
  fetchProducts as apiFetchProducts,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  type ApiProduct,
} from "@/lib/api/productsApi";
import {
  Package, Users, Plus, Edit2, Trash2, Search,
  Menu, X, CreditCard, Loader2
} from "lucide-react";
import InverntoryCrud from "@/components/InventroyCRUD";
import UserDirectory from "@/components/userDirectory";



export default function AdminDashboardPage(){
  const [page,setPage] = useState("Inventory CRUD")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const ADMIN_MOBILE_LINKS = [
  { label: "Inventory CRUD", icon: Package, active: true,onClick:() => setPage("Inventory CRUD")},
  { label: "User Directory", icon: Users, active: false ,onClick:() => setPage("User Directory")},
  { label: "Financial Metrics", icon: CreditCard, active: false,onClick:() => setPage("Finiancial Metrics")},
];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-ink">
      <Sidebar title="Admin Account" sidebarLinks={ADMIN_MOBILE_LINKS} onLogout={logoutRequest} />
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
            {ADMIN_MOBILE_LINKS.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                type="button"
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
        </div>

      
    </div>
  );
}
