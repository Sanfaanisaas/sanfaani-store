"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, Package, Trash2 } from "lucide-react";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import type { CartItem } from "@/lib/redux/slices/cartSlice";
import {
  changeCartItemQuantity,
  initializeCart,
  removeCartItemAction,
} from "@/lib/functions/cartActions";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPrice } from "@/lib/formatPrice";

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.cart);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const [busyItemSku, setBusyItemSku] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!ignore) {
        await initializeCart(isAuthenticated, dispatch);
      }
    };
    void run();
    return () => {
      ignore = true;
    };
  }, [dispatch, isAuthenticated]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  async function handleQtyChange(item: CartItem, nextQty: number) {
    if (nextQty < 1 || busyItemSku) return;
    if (item.maxStock !== undefined && nextQty > item.maxStock) {
      setErrorMessage(
        `Only ${item.maxStock} units available for ${item.name}.`,
      );
      return;
    }

    setBusyItemSku(item.sku);
    setErrorMessage(null);

    try {
      await changeCartItemQuantity({
        sku: item.sku,
        quantity: nextQty,
        previousQuantity: item.quantity,
        isAuthenticated,
        dispatch,
      });
    } catch {
      setErrorMessage(
        "Could not update item quantity. Item may be out of stock or changed in price.",
      );
    } finally {
      setBusyItemSku(null);
    }
  }

  async function handleRemove(item: CartItem) {
    if (busyItemSku) return;
    setBusyItemSku(item.sku);
    setErrorMessage(null);

    try {
      await removeCartItemAction({
        item,
        isAuthenticated,
        dispatch,
      });
    } catch {
      setErrorMessage("Could not remove item from cart. Please try again.");
    } finally {
      setBusyItemSku(null);
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Your cart
        </h1>

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-navy-900/15 bg-white py-16 text-center shadow-sm">
            <Package size={48} className="mx-auto text-mist/60" />
            <p className="mt-3 text-sm text-mist">Your cart is empty.</p>
            <Link
              href="/shop"
              className="mt-4 inline-block rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
            >
              Browse Catalogue →
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {items.map((item) => {
                const isBusy = busyItemSku === item.sku;
                return (
                  <div
                    key={item.sku || item.variantId}
                    className={`flex items-center gap-4 rounded-2xl border border-navy-900/10 bg-white p-4 shadow-sm transition ${
                      isBusy ? "opacity-60" : ""
                    }`}
                  >
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-paper">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <Package size={28} className="text-mist" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-display text-sm font-semibold text-ink">
                        {item.name}
                      </p>
                      <p className="text-xs text-mist">
                        SKU: {item.sku || "N/A"}
                      </p>
                      {item.maxStock !== undefined && (
                        <p className="text-[11px] text-amber-700">
                          {item.maxStock} in stock
                        </p>
                      )}
                    </div>

                    <div className="flex items-center rounded-full border border-navy-900/20">
                      <button
                        type="button"
                        disabled={isBusy || item.quantity <= 1}
                        onClick={() => handleQtyChange(item, item.quantity - 1)}
                        className="px-2.5 py-1 text-ink/70 transition hover:text-ink disabled:opacity-30"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={
                          isBusy ||
                          (item.maxStock !== undefined &&
                            item.quantity >= item.maxStock)
                        }
                        onClick={() => handleQtyChange(item, item.quantity + 1)}
                        className="px-2.5 py-1 text-ink/70 transition hover:text-ink disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <p className="w-24 text-right text-sm font-semibold text-ink">
                      {formatPrice(item.price * item.quantity)}
                    </p>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleRemove(item)}
                      className="p-1 text-mist transition hover:text-red-600 disabled:opacity-30"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="h-fit rounded-2xl border border-navy-900/10 bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-ink">
                Order summary
              </h2>
              <div className="mt-4 flex justify-between text-sm text-ink/70">
                <span>Subtotal</span>
                <span className="font-semibold text-ink">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-xs text-mist">
                <span>Taxes & Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <Link
                href="/checkout"
                className="mt-6 block rounded-full bg-gold py-3.5 text-center text-sm font-semibold text-navy-900 shadow-sm transition hover:brightness-95"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
