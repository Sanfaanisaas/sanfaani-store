# FE-07 and FE-09–FE-13 customer contract matrix

Last verified: 2026-08-31 against `Sanfaanisaas/sanfaani-storebackend` at the sibling workspace. The backend was inspected read-only. `contracts/api-contract.json` identifies OpenAPI 3.1 / API version 1.0.0, but its captured endpoint list is incomplete relative to the current backend route source. The source routes/controllers/models below are therefore the operation-level ground truth; the OpenAPI snapshot needs regeneration before it can be the complete typed source of record.

All endpoint paths below are relative to the frontend proxy/API base (`/api`). Responses use `{ success: true, data }`; errors use `{ success: false, message, errors }`. The frontend API client normalizes 400/422 as validation, 401, 403, non-enumerating 404, 409, 429, and 5xx into explicit UI states.

| Ticket | Frontend route | Operation | Backend endpoint and method | Authentication / ownership | Request and customer-safe response | Canonical statuses | Support / dependency | Planned coverage |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FE-07 | `/repair/request` | Create repair | `POST /repairs` | Bearer customer | JSON `{ device: { type, brand, model, serialNumber? }, issueDescription, privacyAcknowledged: true }`; 201 returns repair plus a raw tracking token and expiry once | `REQUESTED` on creation | Supported; no customer evidence belongs in this request | Authenticated JSON request, validation, duplicate prevention, one-time credential presentation |
| FE-07 | `/repair/track/[id]` | Read tracking | `GET /repairs/:id/track` | Owner bearer **or** `X-Repair-Tracking-Token`; a raw ID is never authorization | Safe projection only: `id`, `status`, `nextAction`, `updatedAt`, and current safe quote | All backend `REPAIR_STATUS` values; quote `SENT`, `VIEWED`, `ACCEPTED`, `DECLINED`, `EXPIRED` | Supported; missing/invalid/foreign credentials use the same 404 | Owner bearer preferred; manually entered token stays only in component memory and is sent only in the header |
| FE-07 | `/repair/track/[id]` | Approve or decline exact quote | `PATCH /repairs/:id/quote/:quoteId/approve` and `/decline` | Authenticated owner (or approved admin); tracking tokens cannot mutate | Approval body empty; decline body may contain a <=500-character reason. Response is the server-confirmed quote | Quote lifecycle is server-enforced; conflicts include expired, superseded, already/actionably decided quotes | Supported. Tracking projection does **not** expose `expiresAt`, superseded state, or deposit/payment state despite internal models carrying some fields | Quote ID/version display and server refetch; no action is rendered for token-only tracking |
| FE-07 | `/repair/request` | Customer evidence | `POST /evidence` | Customer may upload `repair` evidence with `repair_intake` or `warranty` purpose only, after a repair exists | Multipart: one `file`, `subjectType`, `subjectId`, `purpose`; JPEG/PNG/PDF, 5 MiB, one file per request | Evidence retention states only | The repair-create endpoint has no evidence field and no post-create customer repair list; upload is intentionally not attached to creation | Honest unavailable explanation; no staff intake route is called |
| FE-09 | `/account/warranty` | Warranty list/detail | — | — | The backend has only `POST /warranties/:id/claims`; there is no owner warranty list/detail projection | — | **Missing dependency:** `GET /warranties/mine` and customer-safe warranty detail | Show an honest unavailable state and claims that the owner API does expose |
| FE-09 | `/account/warranty` | Create/list claim | `POST /warranties/:id/claims`, `GET /claims/mine` | Bearer owner; create checks warranty ownership and expiry | Create accepts `{ description }`; list returns claims with warranty relation. Frontend allowlists only claim/warranty-safe fields and never renders internal resolution notes | `submitted`, `screening`, `inspection_required`, `under_inspection`, `approved`, `rejected`, `remedy_in_progress`, `resolved`, `closed`, `cancelled` | Partial: no claim detail, eligibility projection, duplicate guarantee, or customer evidence association endpoint | Render owned claim list and customer-safe status only; claim submission waits for warranty-list capability |
| FE-09 | `/account/returns` | Return request/list | `POST /returns/orders/:orderId`, `GET /returns/mine` | Bearer owner; create verifies order ownership | `{ items: [{ variantSku, quantity }], reason, evidenceIds? }`; owner list only. Frontend will use owned orders, no raw evidence/storage data | `SUBMITTED`, `INSPECTION_REQUIRED`, `UNDER_INSPECTION`, `APPROVED`, `REJECTED`, `REMEDY_IN_PROGRESS`, `RESOLVED`, `CANCELLED`; remedies: repair/replacement/refund/store_credit | Partial: no eligibility, detail, payment-refund confirmation, or documented customer evidence attachment workflow | Return request/list only; server-controlled eligibility unavailable state and no completed-refund claim |
| FE-10 | `/support` | Ticket create/list/reply | `POST /support-tickets`, `GET /support-tickets/mine`, `POST /support-tickets/:id/reply` | Bearer customer; list is owner-scoped; reply authorizes owner or staff | Create `{ subject, relatedOrder?, relatedRepair?, message }`; reply `{ body }`. Frontend does not render customer IDs, staff IDs, or routing data | `open`, `in_progress`, `resolved`, `closed` | Supported, with no separate customer detail endpoint, categories, priority, SLA, or evidence contract | Owned list, safe conversation projection, reply and server-confirmed status |
| FE-10 | `/notifications` | Notification centre/preferences | — | — | No notification, unread-count, mark-read, mark-all-read, or preference route/model exists | — | **Missing dependency:** owner notification and preference APIs, plus an allowed resource-link projection | Honest unavailable state; no local-only preference persistence |
| FE-11 | `/guidance` | Deterministic guidance | `POST /guidance`, `GET /guidance/:id` | Optional bearer owner; otherwise an `X-Guidance-Resume-Token` is required to resume | Request supports `budget`, `useCase`, `brands`, `categories`, `requiredFeatures`. Response has session ID, fixed deterministic recommendation factors/availability and one-time resume token | `ACTIVE`, `NO_MATCH`, `STALE`, `ARCHIVED` | Partially supported. Results reference real variant IDs and are reconciled to public catalogue before commercial actions | Accessible intake; live public catalogue lookup; clear source/factors/no-match; unauthenticated token stays in component memory |
| FE-11 | `/guidance` | Saved recommendations/advisor escalation | `POST /guidance`, `GET /guidance/:id` only | Authenticated owner can resume an ID they retain | Backend persists an owned session but has no owner list, explicit rules/model version field, saved-results list, or escalation route | — | **Missing dependency:** saved-list/version projection and advisor escalation endpoint | Session result only; no account-synced saved list or invented advisor contact |
| FE-12 | `/procurement` | Customer procurement request, quote, decision, document | — | — | Existing `/procurement/*` routes are internal supplier/purchase-order operations requiring inventory/operations roles and include prohibited cost/supplier data | Internal purchase-order statuses only | **Missing dependency:** customer procurement request/list/detail, customer quotation versions/approval/decline, document projection/download, conversion order state | Dedicated honest unavailable route; internal endpoints are never called |
| FE-13 | `/services` | Compatibility assessment, service quote, maintenance plan/history | — | — | No service-request, compatibility, service quote, maintenance plan, or customer service-history model/route exists | — | **Missing dependency:** all customer service operations and approved policy/consent text | Dedicated honest unavailable route with safe preliminary disclosures only; no service action is simulated |

## Cross-ticket authorization and transport decisions

- The approved `apiClient` is the sole client. It attaches the in-memory bearer token, retains the HTTP-only refresh-cookie flow, normalizes safe error states, and supports idempotency keys. No second fetch/Axios wrapper is permitted.
- Repair creation is JSON, not multipart. Evidence uses the separately authorized multipart `/evidence` contract only after a valid subject exists. The frontend never calls the staff intake route.
- Tracking tokens are never routed, persisted, logged, or placed in analytics. The tracking screen accepts a token in a password-like field for the current tab only; an authenticated owner request deliberately omits the token header.
- Quote decisions always use the quote document ID in the path, never a repair ID in its place, and are unavailable in token-only tracking mode.
- The UI will render only allowlisted customer DTO fields at the API boundary. It will not expose IDs for staff/other users, raw storage keys, signed URLs, private notes, supplier cost, internal audit information, or untrusted HTML.
- Mutations use server confirmation as success, prevent duplicate submission locally, use idempotency keys where the route supports them, and refetch the affected owned data after confirmation. No non-idempotent mutation is automatically retried.

## Required backend follow-up

1. Regenerate and commit the OpenAPI snapshot so it includes the verified current routes and customer-safe schemas.
2. Add owner warranty list/detail and claim detail/eligibility/projection routes before full warranty/claim submission can be completed safely.
3. Add return eligibility/detail and customer-safe refund-payment state before the UI can promise remedies or refund completion.
4. Add owner notification/preference routes and an allowlisted resource-link projection.
5. Add guidance saved-session listing, rules/model version and advisor-escalation routes if those product capabilities are intended.
6. Add the customer procurement and service/maintenance contracts described in FE-12 and FE-13. Internal purchase-order APIs cannot be repurposed for either ticket.


## Implemented frontend routes and verified states

- FE-07: /repair/request submits authenticated JSON, shows the raw tracking credential only once, supports the authorised multipart repair-evidence upload after confirmation, and never calls staff intake. /repair/track/[id] uses bearer-owner access when signed in or an in-memory X-Repair-Tracking-Token otherwise. It never puts the credential in a URL or persistent storage. Quote approval/decline is visible only to an authenticated owner and uses the quote document ID.
- FE-09: /account/warranty lists customer-safe claim projections and withholds claim submission until warranty list/eligibility exists. /account/returns lists owner-scoped returns and owned order items, submits a server-confirmed request, and supports authorised return evidence after confirmation. It does not claim eligibility or payment refund completion.
- FE-10: /support uses /support-tickets for creation, owned list/conversation, and reply. /notifications is an authenticated unavailable state because no notification API exists.
- FE-11: /guidance submits the deterministic backend intake, resolves results against current public catalogue variants before a product link, explains backend factors and live availability, supports secure resume without browser persistence, and presents a no-match/revise path. No advisor escalation is invented.
- FE-12: /procurement documents the missing customer procurement/quotation contract and never calls staff-only supplier or purchase-order routes.
- FE-13: /services separates upgrades, setup, migration, maintenance, and plans while documenting the absent customer assessment, quote, plan, and service-history contract. It collects no secrets and simulates no service action.

## Verification executed

- pnpm install --frozen-lockfile — passed; no dependency changes.
- pnpm type-check — passed.
- pnpm lint — passed with 0 errors and 0 warnings.
- pnpm test:customer-tickets — passed, 7/7 focused API-boundary tests.
- pnpm test — passed, 11/11 tests: 10 unit and 1 integration.
- pnpm build — passed; all authorised routes compiled.
- pnpm test:e2e — passed, 4 configured browser tests.
- pnpm test:a11y — passed, 1/1 critical-violation check.
- pnpm security:scan — passed; no known credential patterns.

## Ticket disposition

| Ticket | Disposition | Exact reason |
| --- | --- | --- |
| FE-07 | PARTIALLY COMPLETE — EXTERNAL DEPENDENCY | Core creation/tracking/quote/evidence flows are implemented. The customer tracking projection does not expose quote expiry, superseded history, or deposit/payment state, so those cannot be displayed without inventing data. |
| FE-09 | PARTIALLY COMPLETE — EXTERNAL DEPENDENCY | Owned claim list and return request/list/evidence are implemented. Owner warranty list/detail/eligibility, claim detail, and return eligibility/refund confirmation are absent. |
| FE-10 | PARTIALLY COMPLETE — EXTERNAL DEPENDENCY | Ticket create/list/reply are implemented. Ticket detail/SLA/category/evidence and all notification/preference APIs are absent. |
| FE-11 | PARTIALLY COMPLETE — EXTERNAL DEPENDENCY | Deterministic guidance, catalogue revalidation, no-match, and secure resume are implemented. Saved-session listing/rules version and advisor escalation are absent. |
| FE-12 | PARTIALLY COMPLETE — EXTERNAL DEPENDENCY | Customer procurement request, quotation, document, and order-conversion APIs are absent; the implementation deliberately excludes staff-only procurement routes. |
| FE-13 | PARTIALLY COMPLETE — EXTERNAL DEPENDENCY | Customer service assessment, quotes, plans, history, evidence association, and versioned disclosures are absent. |
