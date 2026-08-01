"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import { logoutRequest } from "@/lib/api/authApi";
import Modal from "@/components/Modal";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { useRouter } from "next/navigation";
import { 
  Package, Users, Plus, Edit2, Trash2, Search, 
  TrendingUp, AlertTriangle, Menu, X, CreditCard 
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

const ADMIN_MOBILE_LINKS = [
  { label: "Inventory CRUD", icon: Package, active: true },
  { label: "User Directory", icon: Users, active: false },
  { label: "Financial Metrics", icon: CreditCard, active: false },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, initialized } = useSelector((state: RootState) => state.auth);

  React.useEffect(() => {
    if (initialized && (!user || user.role !== "admin")) {
      router.replace("/operations/user");
    }
  }, [initialized, user, router]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/products");
        const result = await response.json();
        if (result.success) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "Components",
    price: "",
    stock: "",
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      id: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      category: "Components",
      price: "",
      stock: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
    });
    setIsModalOpen(true);
  };

  // Developer-defined custom action passed into Modal
  const handleSaveProduct = async () => {
    // Example: Simulate an async API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newProduct: Product = {
      id: formData.id,
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
    };

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? newProduct : p))
      );
    } else {
      setProducts((prev) => [newProduct, ...prev]);
    }
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-navy-900/10 shadow-sm">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-ink mt-2">Product & Store Management</h1>
              <p className="text-xs text-mist mt-0.5">Manage catalog inventory and track system metrics</p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="bg-gold hover:bg-gold/90 text-navy-900 text-xs font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-navy-900/10 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-mist text-xs font-medium">
                <span>Available Balance</span>
                <span className="font-bold text-emerald-600 text-base">₦</span>
              </div>
              <div className="text-2xl font-extrabold text-ink">₦18,450,000.00</div>
            </div>

            <div className="bg-white border border-navy-900/10 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-mist text-xs font-medium">
                <span>Total Registered Users</span>
                <Users size={16} className="text-navy-900" />
              </div>
              <div className="text-2xl font-extrabold text-ink">1,248 Accounts</div>
            </div>

            <div className="bg-white border border-navy-900/10 rounded-2xl p-5 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-mist text-xs font-medium">
                <span>Total Catalog Items</span>
                <Package size={16} className="text-gold" />
              </div>
              <div className="text-2xl font-extrabold text-ink">{products.length} Products</div>
            </div>
          </div>

          <div className="relative w-full">
            <Search className="w-4 h-4 text-mist absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by SKU or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-paper border border-navy-900/10 rounded-xl pl-10 pr-4 py-3 text-xs text-ink focus:outline-none focus:border-gold"
            />
          </div>

          {/* Table */}
          <div className="bg-white border border-navy-900/10 rounded-2xl shadow-sm overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-paper border-b border-navy-900/10 text-mist font-semibold">
                  <tr>
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price (₦)</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/10">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-mist">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading products...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-mist">
                        No products found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id || p._id} className="hover:bg-paper/50 transition">
                        <td className="p-4 font-bold text-ink">{p.name}</td>
                        <td className="p-4">
                          <span className="bg-paper border border-navy-900/10 text-mist px-2 py-0.5 rounded text-[10px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-ink">
                          ₦{p.price.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 font-bold">
                          <span className={p.stock < 5 ? "text-amber-600" : "text-emerald-600"}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button 
                            type="button" 
                            onClick={() => handleOpenEditModal(p)}
                            className="text-mist hover:text-navy-900 p-1"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDelete(p.id || p._id)} 
                            className="text-mist hover:text-rose-600 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal with Developer-Defined Submission Function */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product Details" : "Add New Product"}
        onSubmit={handleSaveProduct}
        submitText={editingProduct ? "Save Changes" : "Create Product"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-mist mb-1">SKU Reference</label>
            <input
              type="text"
              disabled
              value={formData.id}
              className="w-full bg-paper/50 border border-navy-900/10 rounded-xl px-3 py-2 text-xs text-mist font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-mist mb-1">Product Title</label>
            <input
              type="text"
              required
              placeholder="e.g. OLED Display Assembly"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-paper border border-navy-900/10 rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-mist mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-paper border border-navy-900/10 rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-gold"
            >
              <option value="Screens">Screens</option>
              <option value="Batteries">Batteries</option>
              <option value="Components">Components</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Price (₦)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-paper border border-navy-900/10 rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mist mb-1">Stock Units</label>
              <input
                type="number"
                required
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-paper border border-navy-900/10 rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}