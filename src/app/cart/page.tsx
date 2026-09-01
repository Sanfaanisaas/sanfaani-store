"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EmptyState, ErrorState, LoadingState } from "@/components/ApiState";
import { formatPrice } from "@/lib/formatPrice";
import { removeCartLine, updateCartQuantity } from "@/lib/functions/cartActions";
import { selectCartItems, selectCartState } from "@/lib/redux/slices/cartSlice";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import { errorMessage } from "@/lib/api/client";
import { useState } from "react";

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const store = useSelector((state: RootState) => state);
  const items = useSelector(selectCartItems);
  const cart = useSelector(selectCartState);
  const isAuthenticated = store.auth.isAuthenticated;
  const [message, setMessage] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function changeQty(variantId: string, variantSku: string, quantity: number) {
    try {
      await updateCartQuantity({ variantId, variantSku, quantity, isAuthenticated, dispatch, getState: () => store });
      setMessage(null);
    } catch (error) {
      setMessage(errorMessage(error, "We could not update that quantity."));
    }
  }

  async function remove(variantId: string, variantSku: string) {
    try {
      await removeCartLine({ variantId, variantSku, isAuthenticated, dispatch, getState: () => store });
      setMessage(null);
    } catch (error) {
      setMessage(errorMessage(error, "We could not remove that item."));
    }
  }

  return (
    <main className="bg-paper">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink">Your cart</h1>
        {cart.status === "loading" || cart.status === "hydrating" || cart.status === "merging" ? (
          <div className="mt-8"><LoadingState>Loading your cart…</LoadingState></div>
        ) : cart.status === "error" ? (
          <div className="mt-8"><ErrorState message={cart.error ?? "Your cart is unavailable."} /></div>
        ) : items.length === 0 ? (
          <div className="mt-10">
            <EmptyState title="Your cart is empty">
              <Link href="/shop" className="mt-4 inline-block text-sm font-medium text-blue hover:underline">Browse devices →</Link>
            </EmptyState>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            {cart.conflicts.length > 0 && (
              <div role="alert" className="lg:col-span-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
                {cart.conflicts.map((conflict) => <p key={conflict.type + conflict.message}>{conflict.message}</p>)}
              </div>
            )}
            {message && <p role="status" className="lg:col-span-2 text-sm text-mist">{message}</p>}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-4 rounded-xl border border-navy-900/10 bg-white p-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-navy-900/4 text-2xl" aria-hidden="true">📦</div>
                  <div className="flex-1">
                    <p className="font-display text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-mist">{item.availability.replaceAll("_", " ")} · {formatPrice(item.price)} each</p>
                    {item.priceChanged ? <p className="text-xs text-amber-700">Price updated since it was added.</p> : null}
                  </div>
                  <div className="flex items-center rounded-full border border-navy-900/20">
                    <button type="button" disabled={Boolean(cart.pendingVariants[item.variantId])} onClick={() => void changeQty(item.variantId, item.sku, item.quantity - 1)} className="px-2.5 py-1 text-ink/70">−</button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button type="button" disabled={Boolean(cart.pendingVariants[item.variantId])} onClick={() => void changeQty(item.variantId, item.sku, item.quantity + 1)} className="px-2.5 py-1 text-ink/70">+</button>
                  </div>
                  <p className="w-24 text-right text-sm font-semibold text-ink">{formatPrice(item.price * item.quantity)}</p>
                  <button type="button" disabled={Boolean(cart.pendingVariants[item.variantId])} onClick={() => void remove(item.variantId, item.sku)} className="text-xs text-mist hover:text-red-600">Remove</button>
                </div>
              ))}
            </div>
            <div className="h-fit rounded-xl border border-navy-900/10 bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-ink">Order summary</h2>
              <div className="mt-4 flex justify-between text-sm text-ink/70">
                <span>Indicative subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-2 text-xs text-mist">Final totals, delivery and stock are confirmed at checkout.</p>
              <Link href={isAuthenticated ? "/checkout" : "/login?next=/checkout"} className="mt-6 block rounded-full bg-navy-900 px-6 py-3 text-center text-sm font-medium text-paper hover:bg-navy-800">
                {isAuthenticated ? "Proceed to checkout" : "Sign in to checkout"}
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
