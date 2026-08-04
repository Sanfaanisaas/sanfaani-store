"use client";
import { useState } from "react";
import {
  Package, Users, Plus, Edit2, Trash2, Search,
  Menu, X, CreditCard, Loader2
} from "lucide-react";

interface User{
    id:Number,
    name:String,
    email:String,
    role:String,
}

const MOCKUP_USER_DATA = [
    {"id":1,"name" : "James" , "email" : "james@gmail.com" , "role" : "client"},
    {"id":2,"name" : "Rina" , "email" : "james@gmail.com" , "role" : "client"},
    {"id":3,"name" : "Neo" , "email" : "james@gmail.com" , "role" : "client"},
    {"id":4,"name" : "Postman" , "email" : "james@gmail.com" , "role" : "admin"},
    {"id":5,"name" : "Mitsuki" , "email" : "james@gmail.com" , "role" : "technician"},
    {"id":6,"name" : "Lara" , "email" : "james@gmail.com" , "role" : "technician"},
]


export default function UserDirectory(){
      const [user, setUser] = useState<User[]>(MOCKUP_USER_DATA);
      const [loading, setLoading] = useState(false); // Set to false to ease my work
      const [search, setSearch] = useState("");


  const filtereduser = user.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      String(p.id).toLowerCase().includes(search.toLowerCase())
  );
    return(
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-navy-900/10 shadow-sm">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-ink mt-2">User Management</h1>
              <p className="text-xs text-mist mt-0.5">Manage catalog inventory and track system metrics</p>
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
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
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
                  ) : filtereduser.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-mist">
                        No products found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filtereduser.map((p) => (
                      <tr key={String(p.id)} className="hover:bg-paper/50 transition">
                        <td className="p-4 font-bold text-ink">{p.name}</td>
                        <td className="p-4 font-bold text-ink">{p.email}</td>
                         <td className="p-4 font-bold text-ink">{p.role}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
    )
}