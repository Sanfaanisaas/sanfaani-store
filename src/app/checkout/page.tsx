"use client";

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isAxiosError } from "axios";
import {
  AlertCircle,
  Banknote,
  CreditCard,
  Loader2,
  Package,
  Truck,
  Store,
  RefreshCw,
} from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import axiosInstance from "@/lib/api/axiosInstance";
import { clearCart } from "@/lib/redux/slices/cartSlice";
import type { RootState } from "@/lib/redux/store";

interface ConflictItem {
  variantSku: string;
  type: "out_of_stock" | "price_changed";
  message: string;
  availableStock?: number;
  oldPrice?: number;
  newPrice?: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
}

export default function Checkout() {
  const dispatch = useDispatch();
  const summaryItems = useSelector((state: RootState) => state.cart);

  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<
    "paystack" | "bank_transfer" | "pay_on_pickup"
  >("paystack");

  // Collected contact details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Address form state
  const [address, setAddress] = useState<ShippingAddress>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
  });

  const [shippingFee, setShippingFee] = useState<number>(0);
  const [isCalculatingFee, setIsCalculatingFee] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictItems, setConflictItems] = useState<ConflictItem[]>([]);

  const subtotal = summaryItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // 1. Authoritative server quote calculation
  const fetchShippingQuote = useCallback(async () => {
    if (mode === "pickup") {
      setShippingFee(0);
      return;
    }

    if (!address.state || !address.city) {
      setShippingFee(0);
      return;
    }

    setIsCalculatingFee(true);
    try {
      const response = await axiosInstance.post("/checkout/estimate", {
        fulfilmentMode: mode,
        shippingAddress: address,
        items: summaryItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      setShippingFee(response.data?.data?.shippingFee ?? 0);
    } catch {
      setShippingFee(0);
    } finally {
      setIsCalculatingFee(false);
    }
  }, [mode, address, summaryItems]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShippingQuote();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchShippingQuote]);

  // Handle mode switches & validate payment eligibility
  const handleModeChange = (newMode: "delivery" | "pickup") => {
    setMode(newMode);
    if (newMode === "delivery" && paymentMethod === "pay_on_pickup") {
      setPaymentMethod("paystack");
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setConflictItems([]);

    // 2. Validate pay-on-pickup eligibility explicitly
    if (paymentMethod === "pay_on_pickup" && mode !== "pickup") {
      setError(
        "Pay on Pickup is only available when Store Pickup is selected.",
      );
      setIsSubmitting(false);
      return;
    }

    // 3. Construct checkout payload with persisted fulfilment mode and contact specs
    const orderPayload = {
      customerName,
      customerPhone,
      paymentMethod,
      fulfilmentMode: mode,
      shippingFee: mode === "delivery" ? shippingFee : 0,
      shippingAddress: mode === "delivery" ? address : undefined,
      items: summaryItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await axiosInstance.post("/checkout", orderPayload);
      const order = response.data.data;

      dispatch(clearCart());

      // 4. Paystack authorization redirect without optimistic client-declared success
      if (paymentMethod === "paystack") {
        const payRes = await axiosInstance.post("/payments/initiate", {
          orderId: order._id,
        });
        window.location.href = payRes.data.data.authorizationUrl;
      } else {
        // Redirect to order details to await webhook/server state confirmation
        window.location.href = `/account/orders?highlight=${order._id}`;
      }
    } catch (err: unknown) {
      // 5. Stock/price conflict (409 Conflict) and retry states
      if (isAxiosError(err)) {
        if (err.response?.status === 409) {
          setConflictItems(err.response.data.errors || []);
          setError(
            err.response.data.message ||
              "Cart items have changed. Please review the details below.",
          );
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to place order. Please try again or choose another payment method.",
          );
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="mb-8">
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            Complete your order
          </h1>
          <p className="mt-2 text-sm text-mist">
            Choose how you want to receive your selected gadgets.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span>Checkout Error</span>
            </div>
            <p>{error}</p>
            {conflictItems.length > 0 && (
              <ul className="mt-2 space-y-1 list-disc list-inside">
                {conflictItems.map((c, i) => (
                  <li key={i}>
                    {c.type === "out_of_stock" ? (
                      <>
                        <span className="font-semibold">{c.variantSku}</span> is
                        out of stock
                        {c.availableStock !== undefined && c.availableStock > 0
                          ? ` — only ${c.availableStock} unit(s) available`
                          : ""}
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">{c.variantSku}</span>{" "}
                        price changed from ₦{c.oldPrice?.toLocaleString()} to ₦
                        {c.newPrice?.toLocaleString()}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-navy-900/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-ink">
                Fulfillment & Payment
              </h2>
              <p className="mt-1 text-sm text-mist">
                Provide contact and address details to complete your checkout.
              </p>
            </div>

            {/* Fulfilment Toggle */}
            <div className="mb-6 rounded-2xl border border-navy-900/10 bg-paper p-4">
              <p className="text-sm font-semibold text-ink">
                Fulfillment Option
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleModeChange("delivery")}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    mode === "delivery"
                      ? "border-gold bg-gold/10 text-ink"
                      : "border-navy-900/10 text-mist hover:border-gold/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" aria-hidden="true" />
                    <p className="font-semibold">Doorstep Delivery</p>
                  </div>
                  <p className="mt-1 text-xs text-mist">
                    Shipped directly to your address.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("pickup")}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    mode === "pickup"
                      ? "border-gold bg-gold/10 text-ink"
                      : "border-navy-900/10 text-mist hover:border-gold/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4" aria-hidden="true" />
                    <p className="font-semibold">Store Pickup</p>
                  </div>
                  <p className="mt-1 text-xs text-mist">
                    Collect directly from our store.
                  </p>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Contact Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-xs font-semibold text-ink"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-navy-900/10 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1 block text-xs font-semibold text-ink"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-navy-900/10 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold"
                  />
                </div>
              </div>

              {/* Conditional Address Fields */}
              {mode === "delivery" && (
                <>
                  <div>
                    <label
                      htmlFor="street"
                      className="mb-1 block text-xs font-semibold text-ink"
                    >
                      Street Address
                    </label>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      required
                      value={address.street}
                      onChange={handleAddressChange}
                      className="w-full rounded-xl border border-navy-900/10 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="city"
                        className="mb-1 block text-xs font-semibold text-ink"
                      >
                        City
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        value={address.city}
                        onChange={handleAddressChange}
                        className="w-full rounded-xl border border-navy-900/10 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="state"
                        className="mb-1 block text-xs font-semibold text-ink"
                      >
                        State
                      </label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        required
                        value={address.state}
                        onChange={handleAddressChange}
                        className="w-full rounded-xl border border-navy-900/10 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="postalCode"
                        className="mb-1 block text-xs font-semibold text-ink"
                      >
                        Postal Code
                      </label>
                      <input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        value={address.postalCode}
                        onChange={handleAddressChange}
                        className="w-full rounded-xl border border-navy-900/10 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="country"
                        className="mb-1 block text-xs font-semibold text-ink"
                      >
                        Country
                      </label>
                      <input
                        id="country"
                        name="country"
                        type="text"
                        required
                        value={address.country}
                        onChange={handleAddressChange}
                        className="w-full rounded-xl border border-navy-900/10 bg-paper px-4 py-2.5 text-sm text-ink outline-none transition focus:border-gold"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Payment Method Options */}
              <div className="pt-2">
                <p className="text-sm font-semibold text-ink">
                  Select Payment Method
                </p>
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
                      <CreditCard className="h-4 w-4" aria-hidden="true" />
                      <p className="font-semibold text-sm">Paystack</p>
                    </div>
                    <p className="mt-1 text-xs text-mist">Card or Bank App</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank_transfer")}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      paymentMethod === "bank_transfer"
                        ? "border-gold bg-gold/10 text-ink"
                        : "border-navy-900/10 text-mist hover:border-gold/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" aria-hidden="true" />
                      <p className="font-semibold text-sm">Bank Transfer</p>
                    </div>
                    <p className="mt-1 text-xs text-mist">Manual Wire</p>
                  </button>

                  {mode === "pickup" && (
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
                        <Package className="h-4 w-4" aria-hidden="true" />
                        <p className="font-semibold text-sm">Pay on Pickup</p>
                      </div>
                      <p className="mt-1 text-xs text-mist">Pay at Counter</p>
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || summaryItems.length === 0}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 px-5 py-3.5 text-sm font-semibold text-paper transition hover:bg-navy-800 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <span>Place Order & Pay ₦{total.toLocaleString()}</span>
                )}
              </button>
            </form>
          </section>

          {/* Order Breakdown Panel */}
          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-navy-900/10 bg-paper p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4">
                <h2 className="text-lg font-semibold text-ink">
                  Order Summary
                </h2>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gold border border-navy-900/5">
                  {summaryItems.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                  Items
                </span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {summaryItems.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-center justify-between rounded-2xl border border-navy-900/10 bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-ink">
                        {item.name}
                      </p>
                      <p className="text-xs text-mist">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-ink">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t border-dashed border-navy-900/10 pt-4 text-xs text-mist">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-ink">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Fulfillment ({mode})</span>
                  <span className="font-semibold text-ink flex items-center gap-1">
                    {isCalculatingFee ? (
                      <RefreshCw className="h-3 w-3 animate-spin text-gold" />
                    ) : (
                      `₦${shippingFee.toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-navy-900/10 pt-2 text-sm font-bold text-ink">
                  <span>Total Due</span>
                  <span className="text-gold">₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
