"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ApiError, errorMessage } from "@/lib/api/client";
import { createCheckout, type CheckoutPaymentMethod } from "@/lib/api/checkoutApi";
import { initiateOrderPayment } from "@/lib/api/paymentsApi";
import { checkPickupEligibility } from "@/lib/api/ordersApi";
import { replaceCart } from "@/lib/redux/slices/cartSlice";
import { selectCartItems } from "@/lib/redux/slices/cartSlice";
import type { AppDispatch } from "@/lib/redux/store";
import type { NormalizedOrder } from "@/lib/api/normalizers/orderNormalizer";

type FulfilmentMode = "delivery" | "pickup";

function CheckoutContent() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const items = useSelector(selectCartItems);
  const [fulfilmentMode, setFulfilmentMode] = useState<FulfilmentMode>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("paystack");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [quote, setQuote] = useState<NormalizedOrder | null>(null);
  const [pickupEligible, setPickupEligible] = useState<boolean | null>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const indicativeSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (paymentMethod !== "pay_on_pickup") {
        setPickupEligible(null);
        return;
      }
      const city = (document.getElementById("city") as HTMLInputElement | null)?.value ?? "";
      void checkPickupEligibility(indicativeSubtotal, { city })
        .then((result) => setPickupEligible(result.eligible))
        .catch(() => setPickupEligible(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [indicativeSubtotal, paymentMethod]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) {
      setMessage("Your cart is empty.");
      return;
    }
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setMessage(null);
    try {
      const shippingAddress = fulfilmentMode === "pickup"
        ? {
            street: "Pickup at Sanfaani store",
            city: String(form.get("city") ?? "ibadan-central"),
            state: String(form.get("state") ?? "Oyo"),
            country: String(form.get("country") ?? "Nigeria"),
          }
        : {
            street: String(form.get("street")),
            city: String(form.get("city")),
            state: String(form.get("state")),
            country: String(form.get("country")),
            postalCode: String(form.get("postalCode") ?? ""),
          };

      const order = await createCheckout({ paymentMethod, shippingAddress }, idempotencyKey);
      setQuote(order);
      dispatch(replaceCart([]));

      if (paymentMethod === "paystack") {
        const payment = await initiateOrderPayment(order.id, String(form.get("email")), crypto.randomUUID());
        if (payment.authorizationUrl) {
          sessionStorage.setItem("pendingCheckoutOrderId", order.id);
          if (payment.paymentId) sessionStorage.setItem("pendingCheckoutPaymentId", payment.paymentId);
          window.location.assign(payment.authorizationUrl);
          return;
        }
      }

      router.push("/checkout/confirmation?orderId=" + encodeURIComponent(order.id));
    } catch (error) {
      if (error instanceof ApiError && error.kind === "conflict") {
        setMessage("Your cart changed. Review availability and prices, then try again.");
      } else {
        setMessage(errorMessage(error, "We could not complete checkout."));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const totals = quote ?? null;

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-3xl font-semibold">Checkout</h1>
        <p className="mt-2 text-sm text-mist">The server confirms final price, stock, payment, and order status.</p>
        {message && <p role="status" className="mt-5 rounded-xl bg-paper p-4 text-sm">{message}</p>}
        {!items.length && !totals ? (
          <section className="mt-6 rounded-2xl border bg-white p-6">
            <p>Your cart is empty.</p>
            <Link href="/shop" className="mt-3 inline-block font-semibold text-blue underline">Browse the catalogue</Link>
          </section>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-6 rounded-3xl border bg-white p-6 md:grid-cols-2">
            <section className="space-y-4">
              <fieldset>
                <legend className="text-sm font-semibold">Fulfilment mode</legend>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2"><input type="radio" name="fulfilment" checked={fulfilmentMode === "delivery"} onChange={() => setFulfilmentMode("delivery")} />Delivery</label>
                  <label className="flex items-center gap-2"><input type="radio" name="fulfilment" checked={fulfilmentMode === "pickup"} onChange={() => setFulfilmentMode("pickup")} />Pickup</label>
                </div>
              </fieldset>
              <label className="block text-sm">Email<input required name="email" type="email" autoComplete="email" className="mt-1 w-full rounded-xl border p-2" /></label>
              {fulfilmentMode === "delivery" ? (
                <>
                  <label className="block text-sm">Street<input required name="street" autoComplete="street-address" className="mt-1 w-full rounded-xl border p-2" /></label>
                  <label className="block text-sm">Postal code<input name="postalCode" autoComplete="postal-code" className="mt-1 w-full rounded-xl border p-2" /></label>
                </>
              ) : (
                <p className="rounded-xl bg-paper p-3 text-sm text-mist">Pickup location and instructions are confirmed on your order after checkout.</p>
              )}
              <label className="block text-sm">City<input required id="city" name="city" autoComplete="address-level2" className="mt-1 w-full rounded-xl border p-2" /></label>
              <label className="block text-sm">State<input required name="state" autoComplete="address-level1" className="mt-1 w-full rounded-xl border p-2" /></label>
              <label className="block text-sm">Country<input required name="country" defaultValue="Nigeria" autoComplete="country-name" className="mt-1 w-full rounded-xl border p-2" /></label>
              <fieldset>
                <legend className="text-sm font-semibold">Payment method</legend>
                <div className="mt-2 space-y-2">
                  {([["paystack", "Pay online"], ["bank_transfer", "Bank transfer"], ["pay_on_pickup", "Pay on pickup"]] as const).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2">
                      <input checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} type="radio" name="paymentMethod" value={value} />
                      {label}
                    </label>
                  ))}
                </div>
                {paymentMethod === "pay_on_pickup" && pickupEligible === false && (
                  <p role="alert" className="mt-2 text-sm text-amber-700">This order is not eligible for pay-on-pickup.</p>
                )}
              </fieldset>
            </section>
            <aside className="h-fit rounded-2xl bg-paper p-5">
              <h2 className="font-semibold">Order summary</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {items.map((item) => (
                  <li key={item.variantId} className="flex justify-between gap-3">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₦{(item.price * item.quantity).toLocaleString("en-NG")}</span>
                  </li>
                ))}
              </ul>
              {totals ? (
                <div className="mt-5 space-y-2 border-t pt-4 text-sm">
                  <p className="flex justify-between"><span>Subtotal</span><span>₦{totals.subtotal.toLocaleString("en-NG")}</span></p>
                  <p className="flex justify-between"><span>Delivery</span><span>₦{totals.shippingCost.toLocaleString("en-NG")}</span></p>
                  <p className="flex justify-between"><span>Tax</span><span>₦{totals.tax.toLocaleString("en-NG")}</span></p>
                  <p className="flex justify-between font-semibold"><span>Total</span><span>₦{totals.total.toLocaleString("en-NG")}</span></p>
                </div>
              ) : (
                <p className="mt-5 border-t pt-4 text-xs text-mist">Indicative subtotal: ₦{indicativeSubtotal.toLocaleString("en-NG")}. Authoritative totals are calculated when you place the order.</p>
              )}
              <button disabled={submitting || (paymentMethod === "pay_on_pickup" && pickupEligible === false)} className="mt-5 w-full rounded-full bg-gold px-5 py-3 font-semibold text-navy-900 disabled:opacity-50">
                {submitting ? "Creating order…" : "Place order"}
              </button>
            </aside>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function CheckoutPage() {
  return <ProtectedRoute><CheckoutContent /></ProtectedRoute>;
}
