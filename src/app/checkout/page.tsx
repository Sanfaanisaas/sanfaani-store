"use client";

import { useState } from "react";
import { Banknote, CreditCard, Package, Truck } from "lucide-react";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useSelector } from "react-redux";


export default function Checkout() {
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "bank_transfer" | "pay_on_pickup">("paystack");
  let summaryItems = useSelector((state: RootState) => state.cart);

  const subtotal = summaryItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = mode === "delivery" ? 15000 : 0;
  const total = subtotal + shipping;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictItems, setConflictItems] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setConflictItems([]);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const orderData = {
      mode,
      paymentMethod,
      shippingAddress: {
        name: formData.get("name"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        city: formData.get("city"),
        state: formData.get("state"),
        zip: formData.get("zip"),
      }
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.status === 409) {
        // Stock/Price conflict
        setConflictItems(result.conflicts || []);
        setError("Some items in your cart have changed price or are no longer in stock. Please review the changes below.");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Failed to place order");
      }

      // Success - redirect to payment or confirmation
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        window.location.href = `/checkout/confirmation?id=${result.orderId}`;
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="mb-8">
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Complete your order</h1>
          <p className="mt-2 text-sm text-mist">Choose how you want to receive your selected gadgets.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>Checkout Error</span>
            </div>
            <p>{error}</p>
            {conflictItems.length > 0 && (
              <ul className="list-disc list-inside mt-2 space-y-1">
                {conflictItems.map((c, i) => (
                  <li key={i}>{c.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-navy-900/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-ink">Delivery details</h2>
              <p className="mt-1 text-sm text-mist">We&apos;ll keep your information secure and use it only for this order.</p>
            </div>

            <div className="mb-6 rounded-2xl border border-navy-900/10 bg-paper p-4">
              <p className="text-sm font-semibold text-ink">Select option</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode("delivery")}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    mode === "delivery"
                      ? "border-gold bg-gold/10 text-ink"
                      : "border-navy-900/10 text-mist hover:border-gold/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <p className="font-semibold">Delivery</p>
                  </div>
                  <p className="mt-1 text-sm">Have it brought to your doorstep.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("pickup")}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    mode === "pickup"
                      ? "border-gold bg-gold/10 text-ink"
                      : "border-navy-900/10 text-mist hover:border-gold/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <p className="font-semibold">Pickup</p>
                  </div>
                  <p className="mt-1 text-sm">Collect from our store at your convenience.</p>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-semibold text-ink">Full Name</label>
                  <input id="name" name="name" type="text" required className="w-full rounded-xl border border-navy-900/10 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold" />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1 block text-sm font-semibold text-ink">Phone Number</label>
                  <input id="phone" name="phone" type="tel" required className="w-full rounded-xl border border-navy-900/10 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold" />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="mb-1 block text-sm font-semibold text-ink">Address</label>
                <input id="address" name="address" type="text" required className="w-full rounded-xl border border-navy-900/10 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className="mb-1 block text-sm font-semibold text-ink">City</label>
                  <input id="city" name="city" type="text" required className="w-full rounded-xl border border-navy-900/10 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold" />
                </div>
                <div>
                  <label htmlFor="state" className="mb-1 block text-sm font-semibold text-ink">State</label>
                  <input id="state" name="state" type="text" required className="w-full rounded-xl border border-navy-900/10 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold" />
                </div>
              </div>

              <div>
                <label htmlFor="zip" className="mb-1 block text-sm font-semibold text-ink">ZIP Code</label>
                <input id="zip" name="zip" type="text" required className="w-full rounded-xl border border-navy-900/10 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold" />
              </div>

              <div>
                 <p className="text-sm font-semibold text-ink">Select payment method</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <button
                        type="button"
                        onClick={() => setPaymentMethod("paystack")}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                            paymentMethod === "paystack"
                                ? "border-gold bg-gold/10 text-ink"
                                : "border-navy-900/10 text-mist hover:border-gold/40"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <p className="font-semibold">Paystack</p>
                        </div>
                        <p className="mt-1 text-sm text-mist">Pay securely using Paystack.</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPaymentMethod("bank_transfer")}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                            paymentMethod === "bank_transfer"
                                ? "border-gold bg-gold/10 text-ink  "
                                : "border-navy-900/10 text-mist hover:border-gold/40"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            <p className="font-semibold">Bank Transfer</p>
                        </div>
                        <p className="mt-1 text-sm text-mist">Transfer directly to our bank.</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPaymentMethod("pay_on_pickup")}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                            paymentMethod === "pay_on_pickup"
                                ? "border-gold bg-gold/10 text-ink"
                                : "border-navy-900/10 text-mist hover:border-gold/40"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <p className="font-semibold">Pay on Pickup</p>
                        </div>
                        <p className="mt-1 text-sm text-mist">Pay when you collect your order.</p>
                    </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || summaryItems.length === 0}
                className="w-full rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-paper transition hover:bg-navy-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Proceed to payment</span>
                )}
              </button>
            </form>
          </section>

          <aside className="sm:p-8">
            <div className="mt-6 border p-6 shadow-sm rounded-lg border-navy-900/10 bg-paper  space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">Order summary</h2>
              <span className="rounded-full px-3 py-1 text-sm font-semibold tracking-[0.24em] text-gold">
                {summaryItems.length} item(s)
              </span>
            </div>            
              {summaryItems.map((item) => (
                <div key={item.variantId} className="flex items-center justify-between rounded-2xl border border-navy-900/10 bg-white px-4 py-3">
                  <div>
                    <p className="font-semibold text-ink">{item.name}</p>
                    <p className="text-sm text-mist">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-ink">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 p-6 rounded-lg border bg-paper border-t border-navy-900/10 pt-5 text-sm text-mist">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-ink">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{mode === "delivery" ? "Delivery" : "Pickup"}</span>
                <span className="font-semibold text-ink">₦{shipping.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-navy-900/10 pt-3 text-base font-semibold text-ink">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}