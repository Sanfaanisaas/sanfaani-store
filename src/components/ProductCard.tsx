"use client";
import Link from "next/link";
import { Package } from "lucide-react";
import type { PublicProduct } from "@/lib/api/contracts";
import { addGadgetToCart } from "@/lib/functions/cartActions";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/redux/store";
export default function ProductCard({ gadget }: { gadget: PublicProduct }) {
  const dispatch = useDispatch<AppDispatch>(); const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated); const primary = gadget.variants[0]; const available = primary?.availability === "in_stock" || primary?.availability === "low_stock";
  return <article className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm"><div className="flex h-36 items-center justify-center rounded-xl bg-paper text-navy-900"><Package aria-hidden="true" size={42} /></div><p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-mist">{gadget.category}</p><h2 className="mt-1 text-lg font-bold text-ink"><Link href={'/shop/' + gadget.slug} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">{gadget.name}</Link></h2><p className="mt-2 line-clamp-2 text-sm text-mist">{gadget.description}</p><div className="mt-4 flex items-end justify-between gap-3"><p className="font-display text-xl font-semibold text-ink">{primary ? '₦' + primary.price.toLocaleString('en-NG') : 'Unavailable'}</p><span className="text-xs font-semibold text-mist">{primary?.condition.replaceAll('_', ' ') ?? 'No variant'}</span></div><div className="mt-4 flex gap-2"><Link className="rounded-full border border-navy-900/20 px-3 py-2 text-sm font-semibold text-ink" href={'/shop/' + gadget.slug}>Details</Link><button type="button" disabled={!primary || !available} onClick={() => primary && addGadgetToCart({ product: gadget, variant: primary, isAuthenticated, dispatch })} className="rounded-full bg-gold px-3 py-2 text-sm font-semibold text-navy-900 disabled:cursor-not-allowed disabled:opacity-50">Add to cart</button></div></article>;
}
