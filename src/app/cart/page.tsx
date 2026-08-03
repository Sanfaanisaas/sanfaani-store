"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import { removeFromCart, updateQuantity } from "@/lib/redux/slices/cartSlice";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPrice } from "@/lib/formatPrice";

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.cart);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function changeQty(variantId: string, quantity: number) {
    if (quantity < 1) return;
    dispatch(updateQuantity({ variantId, quantity }));
  }

  function remove(variantId: string) {
    dispatch(removeFromCart(variantId));
  }

  return (
    <main className="bg-paper">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-navy-900/15 py-16 text-center">
            <p className="text-sm text-mist">Your cart is empty.</p>
            <Link href="/shop" className="mt-4 inline-block text-sm font-medium text-blue hover:underline">
              Browse devices →
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-4 rounded-xl border border-navy-900/10 bg-white p-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-navy-900/4 text-2xl">📦</div>
                  <div className="flex-1">
                    <p className="font-display text-sm font-semibold text-ink">{item.name}</p>
                  </div>
                  <div className="flex items-center rounded-full border border-navy-900/20">
                    <button onClick={() => changeQty(item.variantId, item.quantity - 1)} className="px-2.5 py-1 text-ink/70">−</button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => changeQty(item.variantId, item.quantity + 1)} className="px-2.5 py-1 text-ink/70">+</button>
                  </div>
                  <p className="w-24 text-right text-sm font-semibold text-ink">{formatPrice(item.price * item.quantity)}</p>
                  <button onClick={() => remove(item.variantId)} className="text-xs text-mist hover:text-red-600">
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="h-fit rounded-xl border border-navy-900/10 bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-ink">Order summary</h2>
              <div className="mt-4 flex justify-between text-sm text-ink/70">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Link href="/checkout" className="mt-6 block rounded-full bg-navy-900 px-6 py-3 text-center text-sm font-medium text-paper hover:bg-navy-800">
                Proceed to checkout
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
