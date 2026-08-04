"use client";

import React, { useState, useEffect } from "react";
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

/**
 * Flat display shape used by the table.
 * price / stock are derived from the first variant (read-only display);
 * they cannot be set on the product document itself — those fields live on Variant.
 */
interface Product {
  _id: string;
  name: string;
  category: string;
  /** Display only — sourced from first variant price, or 0 if no variants. */
  price: number;
  /** Display only — sourced from first variant inStock, or 0 if no variants. */
  stock: number;
}

/** Map the server document to the flat display shape the table expects. */


 

 


const ADMIN_MOBILE_LINKS = [
  { label: "Inventory CRUD", icon: Package, active: true },
  { label: "User Directory", icon: Users, active: false },
  { label: "Financial Metrics", icon: CreditCard, active: false },
];

export default function InventoryCRUD(){

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p._id.toLowerCase().includes(search.toLowerCase())
  );
   // Real API call — state is updated from the server response, not from form data.
  const handleSaveProduct = async () => {
    const payload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      // slug is auto-derived server-side; pass name-based slug for new products
      ...(editingProduct ? {} : { slug: formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }),
    };

    if (editingProduct) {
      const updated = await apiUpdateProduct(editingProduct._id, payload);
      setProducts((prev) =>
        prev.map((p) => (p._id === editingProduct._id ? toDisplayProduct(updated) : p))
      );
    } else {
      const created = await apiCreateProduct(payload);
      setProducts((prev) => [toDisplayProduct(created), ...prev]);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: "", description: "", category: "Components" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: "",
      category: product.category,
    });
    setIsModalOpen(true);
  };
  function toDisplayProduct(p: ApiProduct): Product {
  const firstVariant = p.variants?.[0];
  return {
    _id: p._id,
    name: p.name,
    category: p.category ?? "—",
    price: firstVariant?.price ?? 0,
    stock: firstVariant?.inStock ?? 0,
  };
}



  const handleDelete = async (id: string) => {
    await apiDeleteProduct(id);
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };


   useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await apiFetchProducts();
        setProducts(data.map(toDisplayProduct));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Components",
  });

    return(
     <>
     <div className="flex-1 flex flex-col min-w-0">
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
                      <tr key={p._id} className="hover:bg-paper/50 transition">
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
                            onClick={() => handleDelete(p._id)}
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
            <label className="block text-xs font-semibold text-mist mb-1">Description</label>
            <textarea
              required
              placeholder="Brief description of the product..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-paper border border-navy-900/10 rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-gold resize-none"
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

          <p className="text-[10px] text-mist">
            Price and stock are managed per-variant after product creation.
          </p>
        </div>
      </Modal>
    </>
    )
}