"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

export default function Shop() {
    const [gadgets, setGadgets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [category, setCategory] = useState("All");
    const [condition, setCondition] = useState("All");
    const [page, setPage] = useState(1);
    const pageSize = 6;

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/products");
                const result = await response.json();
                if (result.success) {
                    setGadgets(result.data.products ?? result.data);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const categoryOptions = useMemo(() => ["All", ...Array.from(new Set(gadgets.map((g) => g.category)))], [gadgets]);
    const conditionOptions = useMemo(() => ["All", ...Array.from(new Set(gadgets.map((g) => g.condition || "New")))], [gadgets]);

    const filteredGadgets = useMemo(() => {
        const min = Number(minPrice) || 0;
        const max = Number(maxPrice) || Number.POSITIVE_INFINITY;
        const keyword = search.trim().toLowerCase();

        return gadgets.filter((gadget) => {
            const matchesSearch =
                keyword.length === 0 ||
                gadget.name.toLowerCase().includes(keyword) ||
                (gadget.description && gadget.description.toLowerCase().includes(keyword)) ||
                gadget.category.toLowerCase().includes(keyword);
            const matchesCategory = category === "All" || gadget.category === category;
            const matchesCondition = condition === "All" || (gadget.condition || "New") === condition;
            
            // Handle variants price
            const price = gadget.variants?.[0]?.price || gadget.price || 0;
            const matchesMin = price >= min;
            const matchesMax = price <= max;

            return matchesSearch && matchesCategory && matchesCondition && matchesMin && matchesMax;
        });
    }, [gadgets, category, condition, maxPrice, minPrice, search]);

    const totalPages = Math.max(1, Math.ceil(filteredGadgets.length / pageSize));
    const paginatedGadgets = filteredGadgets.slice((page - 1) * pageSize, page * pageSize);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPage(1);
    };

    return (
        <>
            <Navbar />
            <main className="mx-auto max-w-6xl px-6 py-16">
                <div className="mb-8">
                    <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
                       Explore our premium gadgets.
                    </h1>
                    <p className="mt-2 text-sm text-mist">
                        Search, filter by price, category, and condition, then review the matching results below.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-2xl border max-h-130 border-navy-900/10  p-5 shadow-sm"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="search" className="text-sm font-semibold text-ink">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    name="search"
                                    id="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="block w-full rounded-xl border border-navy-900/10 bg-paper py-2.5 pl-3 pr-10 text-sm text-ink outline-none transition focus:border-gold"
                                    placeholder="Search for gadgets..."
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                <div className="space-y-2">
                                    <label htmlFor="min_price" className="text-sm font-semibold text-ink">
                                        Min price
                                    </label>
                                    <input
                                        type="number"
                                        name="min_price"
                                        id="min_price"
                                        min="0"
                                        value={minPrice}
                                        onChange={(event) => setMinPrice(event.target.value)}
                                        className="block w-full rounded-xl border border-navy-900/10 bg-paper py-2.5 px-3 text-sm text-ink outline-none transition focus:border-gold"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="max_price" className="text-sm font-semibold text-ink">
                                        Max price
                                    </label>
                                    <input
                                        type="number"
                                        name="max_price"
                                        id="max_price"
                                        min="0"
                                        value={maxPrice}
                                        onChange={(event) => setMaxPrice(event.target.value)}
                                        className="block w-full rounded-xl border border-navy-900/10 bg-paper py-2.5 px-3 text-sm text-ink outline-none transition focus:border-gold"
                                        placeholder="2000000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-semibold text-ink">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    id="category"
                                    value={category}
                                    onChange={(event) => setCategory(event.target.value)}
                                    className="block w-full rounded-xl border border-navy-900/10 bg-paper py-2.5 pl-3 pr-10 text-sm text-ink outline-none transition focus:border-gold"
                                >
                                    {categoryOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option === "All" ? "All Categories" : option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="condition" className="text-sm font-semibold text-ink">
                                    Condition
                                </label>
                                <select
                                    name="condition"
                                    id="condition"
                                    value={condition}
                                    onChange={(event) => setCondition(event.target.value)}
                                    className="block w-full rounded-xl border border-navy-900/10 bg-paper py-2.5 pl-3 pr-10 text-sm text-ink outline-none transition focus:border-gold"
                                >
                                    {conditionOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option === "All" ? "All Conditions" : option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="mt-6 w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-gold/90"
                        >
                            Apply filters
                        </button>
                    </form>

                    <div className="">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-ink">Results</h2>
                            <span className="text-sm text-mist">{filteredGadgets.length} item(s) found</span>
                        </div>

                        {loading ? (
                             <div className="flex flex-col items-center justify-center py-20 text-mist">
                                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                <p>Loading catalog...</p>
                             </div>
                        ) : filteredGadgets.length > 0 ? (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {paginatedGadgets.map((gadget) => (
                                        <ProductCard key={gadget._id ?? gadget.id} gadget={gadget} />
                                    ))}
                                </div>

                                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                                        disabled={page === 1}
                                        className="rounded-full border border-navy-900/10 px-3 py-2 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <ChevronLeft />
                                    </button>

                                    {Array.from({ length: totalPages }, (_, index) => {
                                        const pageNumber = index + 1;
                                        return (
                                            <button
                                                key={pageNumber}
                                                type="button"
                                                onClick={() => setPage(pageNumber)}
                                                className={`h-9 w-9 rounded-full text-sm font-semibold ${
                                                    pageNumber === page
                                                        ? "bg-gold text-navy-900"
                                                        : "border border-navy-900/10 text-ink"
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}

                                    <button
                                        type="button"
                                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                        disabled={page === totalPages}
                                        className="rounded-full border border-navy-900/10 px-3 py-2 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <ChevronRight />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-xl bg-white px-4 py-10 text-center text-sm text-mist">
                                No gadgets match these filters yet.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}