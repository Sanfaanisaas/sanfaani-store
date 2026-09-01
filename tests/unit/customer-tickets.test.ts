import assert from "node:assert/strict";
import test from "node:test";
import { configureSessionRecovery, setRuntimeAccessToken } from "../../src/lib/api/client";
import { createRepair, decideRepairQuote, fetchRepairTracking } from "../../src/lib/api/repairsApi";
import { normalizeClaim, normalizeReturn, listReturnOrders } from "../../src/lib/api/warrantyApi";
import { normalizeTicket } from "../../src/lib/api/supportApi";
import { normalizeGuidanceSession } from "../../src/lib/api/guidanceApi";
import { evidenceValidationMessage, uploadEvidenceFile } from "../../src/lib/api/evidenceApi";

const originalFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = originalFetch; setRuntimeAccessToken(null); configureSessionRecovery({ refresh: async () => false, onExpired: () => undefined }); });
function ok(data: unknown) { return new Response(JSON.stringify({ success: true, data }), { headers: { "content-type": "application/json" } }); }

test("repair creation uses authenticated JSON and keeps the raw token out of the repair DTO", async () => {
  setRuntimeAccessToken("owner-token"); let received: RequestInit | undefined;
  globalThis.fetch = async (_input, init) => { received = init; return ok({ repair: { _id: "repair-1", customer: "private" }, trackingToken: "token-secret", trackingTokenExpiresAt: "2026-09-01T00:00:00.000Z" }); };
  const result = await createRepair({ device: { type: "phone", brand: "Brand", model: "Model" }, issueDescription: "Screen is cracked", privacyAcknowledged: true });
  assert.equal(new Headers(received?.headers).get("authorization"), "Bearer owner-token");
  assert.equal(new Headers(received?.headers).get("content-type"), "application/json");
  assert.deepEqual(JSON.parse(String(received?.body)), { device: { type: "phone", brand: "Brand", model: "Model" }, issueDescription: "Screen is cracked", privacyAcknowledged: true });
  assert.deepEqual(result, { repairId: "repair-1", trackingToken: "token-secret", trackingTokenExpiresAt: "2026-09-01T00:00:00.000Z" });
});

test("scoped tracking uses only the header and drops forbidden repair fields", async () => {
  let input = ""; let headers: Headers | undefined;
  globalThis.fetch = async (request, init) => {
    input = String(request);
    headers = new Headers(init?.headers);
    return ok({
      id: "repair-1",
      status: "QUOTE_SENT",
      nextAction: "Review",
      updatedAt: "2026-08-31T00:00:00.000Z",
      quote: {
        id: "quote-1",
        version: 2,
        lineItems: [{ description: "Screen", amount: 10000 }],
        totalAmount: 10000,
        estimatedDays: 3,
        status: "SENT",
        issuedAt: "2026-08-31T10:00:00.000Z",
        expiresAt: "2026-09-07T10:00:00.000Z",
        superseded: false,
        supersededByVersion: null,
        depositRequirement: { required: true, amount: 5000, currency: "NGN", dueBeforeWork: true },
        paymentState: { status: "pending", confirmedAmount: 0, remainingAmount: 5000 },
      },
      customer: { email: "private@example.com" },
      diagnosisNotes: "private",
    });
  };
  const tracking = await fetchRepairTracking("repair-1", "scoped-token");
  assert.equal(input.includes("scoped-token"), false);
  assert.equal(headers?.get("x-repair-tracking-token"), "scoped-token");
  assert.deepEqual(Object.keys(tracking).sort(), ["id", "nextAction", "quote", "status", "updatedAt"]);
  assert.equal("customer" in tracking, false);
  assert.equal(tracking.quote?.issuedAt, "2026-08-31T10:00:00.000Z");
  assert.equal(tracking.quote?.expiresAt, "2026-09-07T10:00:00.000Z");
  assert.equal(tracking.quote?.superseded, false);
  assert.equal(tracking.quote?.supersededByVersion, null);
  assert.deepEqual(tracking.quote?.depositRequirement, { required: true, amount: 5000, currency: "NGN", dueBeforeWork: true });
  assert.deepEqual(tracking.quote?.paymentState, { status: "pending", confirmedAmount: 0, remainingAmount: 5000 });
});

test("quote decisions use the quote document ID and never attach a tracking credential", async () => {
  setRuntimeAccessToken("owner-token"); let input = ""; let headers: Headers | undefined; let received: RequestInit | undefined;
  globalThis.fetch = async (request, init) => { input = String(request); received = init; headers = new Headers(init?.headers); return ok({ id: "quote-1" }); };
  await decideRepairQuote({ repairId: "repair-1", quoteId: "quote-1", decision: "decline", reason: "Not proceeding" });
  assert.equal(input.endsWith("/repairs/repair-1/quote/quote-1/decline"), true);
  assert.equal(headers?.get("x-repair-tracking-token"), null);
  assert.deepEqual(JSON.parse(String(received?.body)), { reason: "Not proceeding" });
});

test("customer claim and return projections omit internal notes and foreign owner data", () => {
  const claim = normalizeClaim({ _id: "claim-1", warranty: { _id: "warranty-1", customer: "private" }, description: "Issue", status: "submitted", resolutionNotes: "internal", submittedBy: "private" });
  const request = normalizeReturn({ _id: "return-1", status: "APPROVED", remedy: "refund", owner: "private", privateNotes: "internal", items: [{ variantSku: "SKU-1", quantity: 1 }] });
  assert.deepEqual(claim, { id: "claim-1", warrantyId: "warranty-1", description: "Issue", status: "submitted", createdAt: undefined, updatedAt: undefined });
  assert.deepEqual(request, { id: "return-1", status: "APPROVED", remedy: "refund", createdAt: undefined, updatedAt: undefined, items: [{ variantSku: "SKU-1", quantity: 1 }] });
});

test("return order selection is owner-scoped through the orders endpoint", async () => {
  let input = ""; globalThis.fetch = async (request) => { input = String(request); return ok({ orders: [{ id: "order-1", userId: "private", items: [{ variantSku: "SKU-1", nameSnapshot: "Laptop", quantity: 1 }] }] }); };
  const orders = await listReturnOrders();
  assert.equal(input.endsWith("/orders/mine"), true);
  assert.deepEqual(orders, [{ id: "order-1", createdAt: undefined, items: [{ variantSku: "SKU-1", name: "Laptop", quantity: 1 }] }]);
});

test("support and guidance normalizers retain only customer-safe deterministic fields", () => {
  const ticket = normalizeTicket({ _id: "ticket-1", subject: "Help", status: "open", customer: "private", messages: [{ author: "staff", body: "Reply", createdAt: "2026-08-31T00:00:00.000Z" }] });
  const guidance = normalizeGuidanceSession({ _id: "guidance-1", budget: 200000, useCase: "school", status: "ACTIVE", recommendations: [{ variant: "variant-1", factors: ["within_budget"], availability: "in_stock", score: 100 }], advisorNotes: "internal" });
  assert.deepEqual(ticket.messages, [{ body: "Reply", createdAt: "2026-08-31T00:00:00.000Z" }]);
  assert.deepEqual(guidance.recommendations, [{ variantId: "variant-1", factors: ["within_budget"], availability: "in_stock" }]);
  assert.equal("advisorNotes" in guidance, false);
});


test("evidence upload uses the authorized multipart contract without a storage key", async () => {
  setRuntimeAccessToken("owner-token"); let input = ""; let received: RequestInit | undefined;
  globalThis.fetch = async (request, init) => { input = String(request); received = init; return ok({ evidence: { id: "evidence-1" } }); };
  const file = new File([new Uint8Array([1])], "repair-proof.pdf", { type: "application/pdf" });
  assert.equal(evidenceValidationMessage(file), null);
  await uploadEvidenceFile({ file, subjectType: "repair", subjectId: "repair-1", purpose: "repair_intake" });
  assert.equal(input.endsWith("/evidence"), true);
  assert.equal(new Headers(received?.headers).get("authorization"), "Bearer owner-token");
  assert.equal(new Headers(received?.headers).get("content-type"), null);
  assert.ok(received?.body instanceof FormData);
  const form = received?.body as FormData;
  assert.equal(form.get("subjectType"), "repair");
  assert.equal(form.get("subjectId"), "repair-1");
  assert.equal(form.get("purpose"), "repair_intake");
  assert.equal(form.get("file") instanceof File, true);
});
