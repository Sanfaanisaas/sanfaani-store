"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import Navbar from "@/components/Navbar";
import RepairTimeline from "@/components/repairTimeline";
import { ErrorState, LoadingState } from "@/components/ApiState";
import { customerApiMessage } from "@/lib/api/customerStates";
import {
  decideRepairQuote,
  fetchRepairTracking,
  runtimeTrackingToken,
} from "@/lib/api/repairsApi";
import type { PublicRepairTracking } from "@/lib/api/contracts";
import type { RootState } from "@/lib/redux/store";

function money(amount: number) {
  return "₦" + amount.toLocaleString("en-NG");
}

export default function RepairTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isAuthenticated, initialized } = useSelector(
    (state: RootState) => state.auth,
  );
  const [repair, setRepair] = useState<PublicRepairTracking | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );
  const [message, setMessage] = useState("Repair tracking is unavailable.");
  const [decision, setDecision] = useState<"approve" | "decline" | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    if (!initialized) return;
    setState("loading");
    try {
      const trackingToken = isAuthenticated ? null : runtimeTrackingToken(id);
      setRepair(await fetchRepairTracking(id, trackingToken));
      setState("ready");
    } catch (error) {
      setRepair(null);
      setMessage(customerApiMessage(error, "Repair tracking is unavailable."));
      setState("unavailable");
    }
  }, [id, initialized, isAuthenticated]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function confirmDecision() {
    if (!repair?.quote || !decision || pending) return;
    const currentDecision = decision;
    setPending(true);
    setMessage("");
    try {
      await decideRepairQuote({
        repairId: repair.id,
        quoteId: repair.quote.id,
        decision: currentDecision,
        reason: declineReason,
      });
      setDecision(null);
      setDeclineReason("");
      await load();
      setMessage(
        currentDecision === "approve"
          ? "Your quote approval was confirmed."
          : "Your quote decline was confirmed.",
      );
    } catch (error) {
      setMessage(
        customerApiMessage(error, "We could not record that quote decision."),
      );
    } finally {
      setPending(false);
    }
  }

  const quote = repair?.quote;
  const actionable =
    quote && (quote.status === "SENT" || quote.status === "VIEWED");
  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto max-w-3xl px-6 py-10">
        {!initialized || state === "loading" ? (
          <LoadingState>Loading repair status…</LoadingState>
        ) : state !== "ready" || !repair ? (
          <section>
            <ErrorState message={message} onRetry={() => void load()} />
            <p className="mt-5 text-center text-sm text-mist">
              A repair reference alone is not a tracking credential.{" "}
              <Link
                href="/repair/track"
                className="font-semibold text-blue underline"
              >
                Enter a valid tracking credential
              </Link>{" "}
              or sign in as the repair owner.
            </p>
          </section>
        ) : (
          <article className="rounded-3xl border border-navy-900/10 bg-white p-7">
            <Link
              href="/repair/track"
              className="text-sm font-semibold text-blue underline"
            >
              Track another repair
            </Link>
            <h1 className="mt-5 font-display text-3xl font-semibold">
              Repair tracking
            </h1>
            <p className="mt-2 break-all text-sm text-mist">
              Reference: {repair.id}
            </p>
            <RepairTimeline
              currentStatus={repair.status}
              updatedAt={repair.updatedAt}
            />
            <section
              aria-labelledby="next-action-title"
              className="mt-6 rounded-xl bg-paper p-4"
            >
              <h2 id="next-action-title" className="font-semibold">
                Next action
              </h2>
              <p className="mt-1 text-sm text-mist">{repair.nextAction}</p>
            </section>
            {quote && (
              <section
                aria-labelledby="quote-title"
                className="mt-6 rounded-2xl border border-navy-900/10 p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id="quote-title" className="font-semibold">
                    Quote version {quote.version}
                  </h2>
                  <p className="text-sm text-mist">
                    Status: {quote.status.toLowerCase()}
                  </p>
                </div>
                <ul
                  className="mt-4 space-y-2 text-sm"
                  aria-label="Quote line items"
                >
                  {quote.lineItems.map((line, index) => (
                    <li
                      key={line.description + index}
                      className="flex justify-between gap-4"
                    >
                      <span>{line.description}</span>
                      <span className="shrink-0">{money(line.amount)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between border-t border-navy-900/10 pt-4 font-semibold">
                  <span>Exact total</span>
                  <span>{money(quote.totalAmount)}</span>
                </div>
                <p className="mt-3 text-sm text-mist">
                  Estimated duration: {quote.estimatedDays} day
                  {quote.estimatedDays === 1 ? "" : "s"}.
                </p>
                {!isAuthenticated && actionable && (
                  <p className="mt-4 rounded-xl bg-paper p-3 text-sm text-mist">
                    Quote decisions require the authenticated repair owner. A
                    tracking credential provides read-only status access.
                  </p>
                )}
                {isAuthenticated && actionable && !decision && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setDecision("approve")}
                      className="rounded-full bg-gold px-4 py-2 font-semibold text-navy-900 disabled:opacity-50"
                    >
                      Approve quote
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setDecision("decline")}
                      className="rounded-full border border-navy-900/20 px-4 py-2 font-semibold disabled:opacity-50"
                    >
                      Decline quote
                    </button>
                  </div>
                )}
                {quote.status === "EXPIRED" && (
                  <p className="mt-4 text-sm text-mist">
                    This quote has expired and cannot be decided.
                  </p>
                )}
                {["ACCEPTED", "DECLINED"].includes(quote.status) && (
                  <p className="mt-4 text-sm text-mist">
                    This quote has already been decided and is read-only.
                  </p>
                )}
                {decision && (
                  <section
                    role="alertdialog"
                    aria-labelledby="decision-title"
                    aria-describedby="decision-description"
                    className="mt-5 rounded-xl border border-navy-900/20 bg-paper p-4"
                  >
                    <h3 id="decision-title" className="font-semibold">
                      {decision === "approve"
                        ? "Approve this exact quote?"
                        : "Decline this exact quote?"}
                    </h3>
                    <p
                      id="decision-description"
                      className="mt-1 text-sm text-mist"
                    >
                      You are deciding quote version {quote.version} for{" "}
                      {money(quote.totalAmount)}. The server will recheck
                      ownership, the current version, and expiry before
                      confirming.
                    </p>
                    {decision === "decline" && (
                      <label className="mt-4 block text-sm font-semibold">
                        Reason{" "}
                        <span className="font-normal text-mist">
                          (optional)
                        </span>
                        <textarea
                          value={declineReason}
                          onChange={(event) =>
                            setDeclineReason(event.target.value)
                          }
                          maxLength={500}
                          rows={3}
                          className="mt-1 w-full rounded-xl border border-navy-900/20 p-2 font-normal"
                        />
                      </label>
                    )}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => void confirmDecision()}
                        className="rounded-full bg-gold px-4 py-2 font-semibold text-navy-900 disabled:opacity-50"
                      >
                        {pending ? "Confirming…" : "Confirm"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          setDecision(null);
                          setDeclineReason("");
                        }}
                        className="rounded-full border border-navy-900/20 px-4 py-2 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </section>
                )}
              </section>
            )}
            {message && (
              <p role="status" className="mt-4 text-sm text-mist">
                {message}
              </p>
            )}
          </article>
        )}
      </main>
    </>
  );
}
