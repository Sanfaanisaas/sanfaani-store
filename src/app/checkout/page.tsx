"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  ShieldCheck,
  Truck,
  Store,
  CreditCard,
  Building2,
  HandCoins,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiClient, ApiError, errorMessage } from "@/lib/api/client";
import { clearCart } from "@/lib/redux/slices/cartSlice";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import { formatPrice } from "@/lib/formatPrice";

type FulfilmentMode = "delivery" | "pickup";
type PaymentMethod = "paystack" | "bank_transfer" | "pay_on_pickup";

interface DeliveryQuote {
  fee: number;
  estimatedDays?: number;
  zone?: string;
}

interface CreatedOrder {
  id?: string;
  _id?: string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  deliveryFee?: number;
  paymentMethod?: string;
  bankTransferDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    reference: string;
  };
}

export default function CheckoutPage() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.cart);
  const user = useSelector((state: RootState) => state.auth.user);

  // Form State
  const [fulfilmentMode, setFulfilmentMode] =
    useState<FulfilmentMode>("delivery");
  const [rawPaymentMethod, setRawPaymentMethod] =
    useState<PaymentMethod>("paystack");
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(
    null,
  );
  const [loadingQuote, setLoadingQuote] = useState(false);

  // Derive payment method so pay_on_pickup is only valid when fulfilmentMode is pickup
  const paymentMethod: PaymentMethod =
    fulfilmentMode === "delivery" && rawPaymentMethod === "pay_on_pickup"
      ? "paystack"
      : rawPaymentMethod;

  // Processing & UI State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessageState, setErrorMessageState] = useState<string | null>(
    null,
  );
  const [conflictDetails, setConflictDetails] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<CreatedOrder | null>(
    null,
  );
  const [copiedRef, setCopiedRef] = useState(false);

  // Address inputs for quoting
  const [stateName, setStateName] = useState("Lagos");
  const [cityName, setCityName] = useState("");

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Fetch authoritative delivery quotation
  const fetchQuote = useCallback(async () => {
    if (fulfilmentMode === "pickup") {
      setDeliveryQuote({ fee: 0 });
      return;
    }
    if (!stateName) return;

    setLoadingQuote(true);
    try {
      const res = await apiClient.post<DeliveryQuote>("/checkout/quote", {
        body: {
          fulfilmentMode: "delivery",
          items: items.map((i) => ({ sku: i.sku, quantity: i.quantity })),
          destination: { state: stateName, city: cityName },
        },
      });
      setDeliveryQuote(res);
    } catch {
      // Fallback standard rate if quote endpoint is unavailable
      setDeliveryQuote({ fee: 3500 });
    } finally {
      setLoadingQuote(false);
    }
  }, [fulfilmentMode, stateName, cityName, items]);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      if (!ignore && items.length > 0) {
        await fetchQuote();
      }
    };

    void run();

    return () => {
      ignore = true;
    };
  }, [fetchQuote, items.length]);

  const deliveryFee =
    fulfilmentMode === "pickup" ? 0 : (deliveryQuote?.fee ?? 0);
  const totalAmount = subtotal + deliveryFee;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) {
      setErrorMessageState("Your cart is empty.");
      return;
    }

    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setErrorMessageState(null);
    setConflictDetails(null);

    const idempotencyKey = crypto.randomUUID();

    const payload = {
      fulfilmentMode,
      paymentMethod,
      customer: {
        name: String(form.get("name")),
        email: String(form.get("email")),
        phone: String(form.get("phone")),
      },
      shippingAddress:
        fulfilmentMode === "delivery"
          ? {
              street: String(form.get("street")),
              city: String(form.get("city")),
              state: String(form.get("state")),
              country: String(form.get("country") || "Nigeria"),
            }
          : undefined,
      pickupLocation:
        fulfilmentMode === "pickup"
          ? "Sanfaani Store — Main Branch"
          : undefined,
      // Server owns authoritative price calculation: submit SKUs and quantities only
      items: items.map((item) => ({
        sku: item.sku,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    try {
      const order = await apiClient.post<CreatedOrder>("/checkout", {
        body: payload,
        idempotencyKey,
      });

      const orderId = order.id ?? order._id;
      if (!orderId) {
        throw new Error(
          "Checkout response did not include a valid order identifier.",
        );
      }

      // Online payment via Paystack
      if (paymentMethod === "paystack") {
        const payment = await apiClient.post<{ authorizationUrl?: string }>(
          "/payments/initiate",
          {
            body: {
              subjectType: "order",
              subjectId: orderId,
              email: String(form.get("email")),
            },
            idempotencyKey: crypto.randomUUID(),
          },
        );

        if (payment.authorizationUrl) {
          window.location.assign(payment.authorizationUrl);
          return;
        }
      }

      // Bank Transfer & Pay-on-Pickup settled orders
      dispatch(clearCart());
      setConfirmedOrder(order);
    } catch (error) {
      if (error instanceof ApiError && error.kind === "conflict") {
        setConflictDetails(
          "An item in your cart has updated stock or price. Please review your cart before submitting.",
        );
      } else {
        setErrorMessageState(
          errorMessage(
            error,
            "We could not complete your checkout. Please check details and try again.",
          ),
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Immutable Order Confirmation Receipt UI
  if (confirmedOrder) {
    const orderId = confirmedOrder.id ?? confirmedOrder._id;
    return (
      <>
        <Navbar />
        <main id="main-content" className="mx-auto max-w-2xl px-6 py-16">
          <div className="rounded-3xl border border-navy-900/10 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>

            <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
              Order Placed Successfully!
            </h1>
            <p className="mt-2 text-sm text-mist">
              Order Reference:{" "}
              <strong className="text-ink">
                {confirmedOrder.orderNumber || orderId}
              </strong>
            </p>

            {/* Bank Transfer Details Box */}
            {paymentMethod === "bank_transfer" && (
              <div className="mt-6 rounded-2xl border border-navy-900/10 bg-paper p-5 text-left text-sm">
                <h2 className="font-semibold text-ink flex items-center gap-2">
                  <Building2 size={18} className="text-navy-900" />
                  Bank Transfer Details
                </h2>
                <p className="mt-1 text-xs text-mist">
                  Transfer the exact amount below. Your order will be processed
                  once payment confirms.
                </p>

                <div className="mt-4 space-y-2 rounded-xl bg-white p-4 border border-navy-900/5">
                  <div className="flex justify-between">
                    <span className="text-mist">Bank Name:</span>
                    <strong className="text-ink">
                      Sanfaani Operations / Zenith Bank
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mist">Account Number:</span>
                    <strong className="font-mono text-ink">1012345678</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mist">Account Name:</span>
                    <strong className="text-ink">
                      Sanfaani Technologies Ltd
                    </strong>
                  </div>
                  <div className="flex justify-between items-center border-t border-navy-900/10 pt-2">
                    <span className="text-mist">Payment Reference:</span>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(orderId || "");
                        setCopiedRef(true);
                        setTimeout(() => setCopiedRef(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 font-mono text-xs font-bold text-navy-900 underline"
                    >
                      {orderId}
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
                {copiedRef && (
                  <p className="mt-2 text-right text-xs text-emerald-600">
                    Reference copied!
                  </p>
                )}
              </div>
            )}

            {/* Pay on pickup note */}
            {paymentMethod === "pay_on_pickup" && (
              <div className="mt-6 rounded-2xl border border-amber-900/15 bg-amber-50/50 p-4 text-left text-sm text-amber-950">
                <p className="font-semibold">Pay upon collection</p>
                <p className="mt-1 text-xs text-amber-900/80">
                  Please bring a valid ID and your order reference to our main
                  store to complete payment and collect your items.
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/account/orders"
                className="flex-1 rounded-full bg-navy-900 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
              >
                View Order History
              </Link>
              <Link
                href="/shop"
                className="flex-1 rounded-full border border-navy-900/20 py-3 text-sm font-semibold text-navy-900 transition hover:bg-navy-900/5"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-mist">
          Final prices, stock availability, and delivery fees are verified
          securely by the server.
        </p>

        {errorMessageState && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {errorMessageState}
          </div>
        )}

        {conflictDetails && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            <AlertTriangle
              className="shrink-0 text-amber-600 mt-0.5"
              size={18}
            />
            <div className="flex-1">
              <strong className="block font-semibold">
                Stock / Price Update
              </strong>
              <p>{conflictDetails}</p>
              <Link
                href="/cart"
                className="mt-2 inline-flex items-center gap-1 font-semibold text-amber-950 underline"
              >
                Return to Cart <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {!items.length ? (
          <section className="mt-8 rounded-2xl border border-navy-900/10 bg-white p-8 text-center">
            <p className="text-mist">Your cart is currently empty.</p>
            <Link
              href="/shop"
              className="mt-4 inline-block font-semibold text-navy-900 underline"
            >
              Browse Catalogue
            </Link>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"
          >
            <div className="space-y-6">
              {/* Fulfilment Mode Selector */}
              <section className="rounded-2xl border border-navy-900/10 bg-white p-6">
                <h2 className="text-base font-bold text-ink">
                  1. Fulfilment Method
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfilmentMode("delivery")}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                      fulfilmentMode === "delivery"
                        ? "border-navy-900 bg-navy-900/5 ring-1 ring-navy-900"
                        : "border-navy-900/15 hover:border-navy-900/30"
                    }`}
                  >
                    <Truck className="text-navy-900" size={24} />
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Doorstep Delivery
                      </p>
                      <p className="text-xs text-mist">
                        Direct to your address
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfilmentMode("pickup")}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                      fulfilmentMode === "pickup"
                        ? "border-navy-900 bg-navy-900/5 ring-1 ring-navy-900"
                        : "border-navy-900/15 hover:border-navy-900/30"
                    }`}
                  >
                    <Store className="text-navy-900" size={24} />
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Store Pickup
                      </p>
                      <p className="text-xs text-mist">Free at main branch</p>
                    </div>
                  </button>
                </div>
              </section>

              {/* Contact Information */}
              <section className="rounded-2xl border border-navy-900/10 bg-white p-6 space-y-4">
                <h2 className="text-base font-bold text-ink">
                  2. Contact Details
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-ink">
                    Full Name *
                    <input
                      required
                      name="name"
                      defaultValue={user?.name || ""}
                      autoComplete="name"
                      className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2 text-sm focus:border-navy-900 focus:outline-none"
                    />
                  </label>
                  <label className="block text-sm font-medium text-ink">
                    Phone Number *
                    <input
                      required
                      name="phone"
                      type="tel"
                      defaultValue={user?.phone || ""}
                      autoComplete="tel"
                      className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2 text-sm focus:border-navy-900 focus:outline-none"
                    />
                  </label>
                </div>
                <label className="block text-sm font-medium text-ink">
                  Email Address *
                  <input
                    required
                    name="email"
                    type="email"
                    defaultValue={user?.email || ""}
                    autoComplete="email"
                    className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2 text-sm focus:border-navy-900 focus:outline-none"
                  />
                </label>
              </section>

              {/* Conditional Shipping Address */}
              {fulfilmentMode === "delivery" ? (
                <section className="rounded-2xl border border-navy-900/10 bg-white p-6 space-y-4">
                  <h2 className="text-base font-bold text-ink">
                    3. Delivery Address
                  </h2>
                  <label className="block text-sm font-medium text-ink">
                    Street Address *
                    <input
                      required
                      name="street"
                      autoComplete="street-address"
                      placeholder="e.g. 12 Adeola Odeku St"
                      className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2 text-sm focus:border-navy-900 focus:outline-none"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-ink">
                      City *
                      <input
                        required
                        name="city"
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        onBlur={() => void fetchQuote()}
                        autoComplete="address-level2"
                        className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2 text-sm focus:border-navy-900 focus:outline-none"
                      />
                    </label>
                    <label className="block text-sm font-medium text-ink">
                      State *
                      <input
                        required
                        name="state"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        onBlur={() => void fetchQuote()}
                        autoComplete="address-level1"
                        className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2 text-sm focus:border-navy-900 focus:outline-none"
                      />
                    </label>
                  </div>

                  <label className="block text-sm font-medium text-ink">
                    Country
                    <input
                      required
                      name="country"
                      defaultValue="Nigeria"
                      readOnly
                      className="mt-1 w-full rounded-xl border border-navy-900/10 bg-paper px-3 py-2 text-sm text-mist"
                    />
                  </label>
                </section>
              ) : (
                <section className="rounded-2xl border border-navy-900/10 bg-white p-6">
                  <h2 className="text-base font-bold text-ink">
                    3. Pickup Location
                  </h2>
                  <div className="mt-3 rounded-xl bg-paper p-4 text-sm">
                    <p className="font-semibold text-navy-900">
                      Sanfaani Experience Center
                    </p>
                    <p className="text-xs text-mist mt-0.5">
                      Plot 4, Commercial Avenue, Lagos, Nigeria
                    </p>
                    <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1">
                      <ShieldCheck size={14} /> Ready for collection within 24
                      hours of confirmation
                    </p>
                  </div>
                </section>
              )}

              {/* Payment Method Selector */}
              <section className="rounded-2xl border border-navy-900/10 bg-white p-6">
                <h2 className="text-base font-bold text-ink">
                  4. Payment Method
                </h2>
                <div className="mt-4 space-y-3">
                  <label
                    className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition ${
                      paymentMethod === "paystack"
                        ? "border-navy-900 bg-navy-900/5 ring-1 ring-navy-900"
                        : "border-navy-900/15 hover:border-navy-900/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paystack"
                        checked={paymentMethod === "paystack"}
                        onChange={() => setRawPaymentMethod("paystack")}
                        className="text-navy-900"
                      />
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          Pay Online (Paystack)
                        </p>
                        <p className="text-xs text-mist">
                          Debit/Credit Card, Bank Transfer, USSD
                        </p>
                      </div>
                    </div>
                    <CreditCard className="text-mist" size={20} />
                  </label>

                  <label
                    className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition ${
                      paymentMethod === "bank_transfer"
                        ? "border-navy-900 bg-navy-900/5 ring-1 ring-navy-900"
                        : "border-navy-900/15 hover:border-navy-900/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === "bank_transfer"}
                        onChange={() => setRawPaymentMethod("bank_transfer")}
                        className="text-navy-900"
                      />
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          Direct Bank Transfer
                        </p>
                        <p className="text-xs text-mist">
                          Manual transfer to our verified corporate account
                        </p>
                      </div>
                    </div>
                    <Building2 className="text-mist" size={20} />
                  </label>

                  {fulfilmentMode === "pickup" && (
                    <label
                      className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition ${
                        paymentMethod === "pay_on_pickup"
                          ? "border-navy-900 bg-navy-900/5 ring-1 ring-navy-900"
                          : "border-navy-900/15 hover:border-navy-900/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="pay_on_pickup"
                          checked={paymentMethod === "pay_on_pickup"}
                          onChange={() => setRawPaymentMethod("pay_on_pickup")}
                          className="text-navy-900"
                        />
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            Pay on Pickup
                          </p>
                          <p className="text-xs text-mist">
                            POS or Cash upon store collection
                          </p>
                        </div>
                      </div>
                      <HandCoins className="text-mist" size={20} />
                    </label>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar Order Summary */}
            <aside className="h-fit space-y-4 rounded-2xl border border-navy-900/10 bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-ink">
                Order Summary
              </h2>

              <ul className="divide-y divide-navy-900/5 text-sm">
                {items.map((item) => (
                  <li
                    key={item.sku || item.variantId}
                    className="py-3 flex justify-between gap-2"
                  >
                    <div>
                      <p className="font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-mist">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-ink shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-navy-900/10 pt-4 text-sm">
                <div className="flex justify-between text-mist">
                  <span>Subtotal</span>
                  <span className="font-medium text-ink">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-mist">
                  <span className="flex items-center gap-1">
                    Delivery Quote
                    {loadingQuote && (
                      <RefreshCw size={12} className="animate-spin" />
                    )}
                  </span>
                  <span className="font-medium text-ink">
                    {fulfilmentMode === "pickup"
                      ? "FREE"
                      : formatPrice(deliveryFee)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-navy-900/10 pt-3 text-base font-bold text-ink">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-full bg-gold py-3.5 font-semibold text-navy-900 shadow-sm transition hover:brightness-95 disabled:opacity-50"
              >
                {submitting ? "Placing Order…" : `Confirm & Place Order`}
              </button>

              <p className="text-[11px] text-center text-mist leading-relaxed">
                By placing this order, you agree to Sanfaani{" "}
                <Link href="/policies/terms" className="underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/policies/delivery-pickup" className="underline">
                  Delivery Policy
                </Link>
                .
              </p>
            </aside>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
