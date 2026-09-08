# Route-to-PRD Matrix & Screen Audit (FE-00 through FE-19)

Authoritative evidence-backed matrix mapping every web route and mobile screen against backend API operations, authentication requirements, ownership/role requirements, UI lifecycle states (loading, empty, validation, conflict, unauthorized, forbidden, unavailable, retry), test coverage, and status.

## Web Routes

| Ticket | Route | Audience | API Operation | Authentication | Ownership / Role | Loading | Empty | Validation | Conflict | Unauthorized | Forbidden | Unavailable | Retry | Meaningful Tests | Completion Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FE-14 | `/` | Public | None (Static) | None | None | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | `e2e/route-integrity`, `e2e/public-journeys` | COMPLETE |
| FE-03 | `/shop` | Public | `GET /api/products` | None | None | Skeleton | "No matching devices" | Filter bounds | N/A | N/A | N/A | Error banner | Retry button | `tests/unit/catalogue-params`, `e2e/customer-journeys` | COMPLETE |
| FE-03 | `/shop/[id]` | Public | `GET /api/products/{slug}` | None | None | Skeleton | "Product not found" | Variant selection | Out of stock | N/A | N/A | Error banner | Retry button | `tests/unit/catalogue-params`, `e2e/customer-journeys` | COMPLETE |
| FE-04 | `/cart` | Guest / Customer | `GET/POST/PATCH/DELETE /api/cart`, `POST /api/cart/merge` | Optional | Customer | Spinner | "Cart is empty" | Quantity limits | Stock/price conflict | Login prompt | N/A | Error alert | Retry button | `tests/unit/guest-cart-storage`, `tests/integration/cart` | COMPLETE |
| FE-05 | `/checkout` | Customer | `POST /api/checkout`, `POST /api/payments/initiate` | Required | Customer | Loading quote | Cart empty redirect | Address/Payment schema | Price shift conflict | Redirect `/login` | N/A | Error alert | Retry quote | `e2e/customer-journeys` | COMPLETE |
| FE-05 | `/checkout/confirmation` | Customer | `GET /api/orders/{id}` | Required | Owner | Verifying | "Order not found" | Reference check | Payment failure | Redirect `/login` | 404 safe | Error banner | Retry status | `e2e/customer-journeys` | COMPLETE |
| FE-05 | `/checkout/return` | Customer | `GET /api/payments/{id}` | Required | Owner | Verifying | N/A | Transaction ID | Provider delay | Redirect `/login` | 404 safe | Retry status | Retry check | `e2e/customer-journeys` | COMPLETE |
| FE-02 | `/login`, `/register` | Public | `POST /api/auth/login`, `POST /api/auth/register` | Entry | None | Loading session | N/A | Email/Password validation | Email conflict | N/A | N/A | Service banner | Form retry | `tests/integration/session-recovery` | COMPLETE |
| FE-02 | `/account` | Customer | `GET /api/auth/sessions`, `DELETE /api/auth/sessions/{id}` | Required | Customer | Loading sessions | "No active sessions" | Session ID | Revoke failure | Redirect `/login` | N/A | Service banner | Retry button | `tests/unit/customer-tickets` | COMPLETE |
| FE-06 | `/account/orders` | Customer | `GET /api/orders/mine` | Required | Owner | Loading orders | "No orders placed" | Pagination | Cancellation conflict | Redirect `/login` | Non-owner 404 | Error banner | Retry button | `tests/unit/customer-tickets`, `e2e/customer-journeys` | COMPLETE |
| FE-06 | `/account/orders/[id]` | Customer | `GET /api/orders/{id}`, `PATCH /api/orders/{id}/cancel`, `GET /api/orders/{id}/receipt`, `POST /api/orders/{id}/upload-receipt` | Required | Owner | Loading order | "Order not found" | File upload rules | Cancellation gate | Redirect `/login` | Non-owner 404 | Error banner | Retry button | `tests/unit/customer-tickets`, `e2e/customer-journeys` | COMPLETE |
| FE-09 | `/account/returns` | Customer | `GET /api/returns/mine`, `POST /api/returns/orders/{orderId}` | Required | Owner | Loading returns | "No return requests" | Reason & quantity | Ineligible window | Redirect `/login` | Non-owner 404 | Error banner | Retry button | `tests/unit/customer-tickets`, `e2e/customer-journeys` | COMPLETE |
| FE-09 | `/account/warranty` | Customer | `GET /api/warranties/mine`, `POST /api/warranties/{id}/claims` | Required | Owner | Loading warranties | "No active warranties" | Issue description | Expired warranty | Redirect `/login` | Non-owner 404 | Error banner | Retry button | `tests/unit/customer-tickets`, `e2e/customer-journeys` | COMPLETE |
| FE-14 | `/orders/track` | Public / Customer | `GET /api/orders/{id}` | Optional | Customer | Verifying | "Order not found" | Order reference | N/A | Login prompt | Non-owner 404 | Error alert | Retry check | `e2e/phase1-journeys` | COMPLETE |
| FE-06 | `/orders/repair` | Customer | `GET /api/repairs/mine` | Required | Owner | Loading list | "No repairs" | N/A | N/A | Redirect `/login` | Non-owner 404 | Error banner | Retry button | `tests/unit/customer-tickets` | COMPLETE |
| FE-07 | `/repair/request` | Customer | `POST /api/repairs` | Optional | Customer | Submitting | N/A | Fault description | Intake conflict | Scoped token storage | N/A | Error banner | Form retry | `tests/unit/customer-tickets`, `e2e/customer-journeys` | COMPLETE |
| FE-07 | `/repair/track`, `/repair/track/[id]` | Customer / Scoped | `GET /api/repairs/{id}/track`, `POST /api/repairs/{id}/quote/{quoteId}/decide` | Scoped token or Bearer | Owner / Holder | Loading tracking | "Repair not found" | Quote decision validation | Expired quote | Auth prompt | Scoped token safe | Error alert | Retry button | `tests/unit/customer-tickets`, `e2e/customer-journeys` | COMPLETE |
| FE-10 | `/support` | Customer | `GET /api/support-tickets/mine`, `POST /api/support-tickets`, `POST /api/support-tickets/{id}/reply` | Required | Owner | Loading tickets | "No support tickets" | Message body validation | Ticket closed | Redirect `/login` | Non-owner 404 | Error alert | Retry send | `tests/unit/customer-tickets`, `e2e/customer-journeys` | COMPLETE |
| FE-10 | `/notifications` | Customer | `GET /api/notifications/mine`, `PATCH /api/notifications/read-all`, `GET/PATCH /api/notification-preferences` | Required | Owner | Loading list | "No notifications" | Preference schema | Update conflict | Redirect `/login` | Non-owner 404 | Error banner | Retry button | `tests/unit/customer-tickets`, `e2e/customer-journeys` | COMPLETE |
| FE-11 | `/guidance` | Customer | `GET /api/guidance/mine`, `POST /api/guidance`, `POST /api/guidance/{id}/save`, `POST /api/guidance/{id}/escalations` | Optional | Customer | Loading recommendations | "No matching devices" | Budget & category bounds | Stale recommendation | Login for save | Non-owner 404 | Error banner | Retry quiz | `tests/unit/customer-tickets`, `e2e/customer-journeys` | COMPLETE |
| FE-12 | `/procurement` | Customer | `GET /api/customer-procurement/requests/mine`, `POST /api/customer-procurement/requests`, `POST /api/customer-procurement/quotations/{id}/approve` | Required | Customer | Loading requests | "No procurement requests" | Requirement schema | Expired quote | Redirect `/login` | Non-owner 404 | Error banner | Retry button | `tests/unit/customer-tickets`, `e2e/customer-journeys` | COMPLETE |
| FE-13 | `/services` | Customer | `GET /api/service-requests/mine`, `POST /api/service-requests`, `GET /api/maintenance-plans/mine` | Required | Customer | Loading services | "No active services" | Spec & backup ack | Quote expired | Redirect `/login` | Non-owner 404 | Error banner | Retry button | `tests/unit/customer-tickets`, `e2e/customer-journeys` | COMPLETE |
| FE-15 | `/guides`, `/guides/[slug]` | Public | Repository Content | None | None | N/A | "Guide not found" | Slug check | N/A | N/A | N/A | N/A | N/A | `e2e/route-integrity` | COMPLETE |
| FE-15 | `/policies/*` | Public | Static Policy Markdown | None | None | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | `e2e/route-integrity` | COMPLETE |
| FE-08 | `/operations`, `/operations/admin` | Operations Staff | `GET /api/dashboard/queue`, `POST /api/dashboard/action` | Required | Staff Role | Loading queue | "Queue empty" | Form inputs | Stale role 403 | Redirect `/login` | Forbidden banner | Error alert | Retry queue | `e2e/public-journeys`, `e2e/customer-journeys` | COMPLETE |

---

## Mobile Screens (`mobile/app/`)

| Ticket | Mobile Screen | Audience | API Operation | Session & Storage | Loading | Empty | Validation | Conflict | Unauthorized | Forbidden | Unavailable | Retry | Meaningful Tests | Completion Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FE-19 | `mobile/index` | Public / Customer | `POST /api/auth/login` | SecureStore Token | Spinner | N/A | Form validation | Credential failure | Sign-in prompt | N/A | Service banner | Retry submit | `mobile/tests/security.test.mjs` | COMPLETE |
| FE-19 | `mobile/catalogue` | Public | `GET /api/products` | Shared Types | Text loader | "No products match" | Query input | N/A | N/A | N/A | Offline banner | Retry fetch | `mobile/tests/security.test.mjs` | COMPLETE |
| FE-19 | `mobile/cart` | Guest / Customer | `GET /api/cart`, `POST /api/cart/items` | SecureStore Session | Spinner | "Cart is empty" | Quantity bounds | Stock conflict | Auth prompt | N/A | Offline banner | Retry sync | `mobile/tests/security.test.mjs` | COMPLETE |
| FE-19 | `mobile/checkout` | Customer | `POST /api/checkout` | SecureStore Session | Submitting | Cart empty alert | Email/Address schema | Quote conflict | Sign-in prompt | N/A | Offline banner | Form retry | `mobile/tests/security.test.mjs` | COMPLETE |
| FE-19 | `mobile/orders` | Customer | `GET /api/orders/mine` | SecureStore Session | Text loader | "No orders yet" | N/A | N/A | Sign-in prompt | Non-owner safe | Offline banner | Retry fetch | `mobile/tests/security.test.mjs` | COMPLETE |
| FE-19 | `mobile/repairs` | Customer | `GET /api/repairs/{id}/track` | Scoped / SecureStore | Submitting | N/A | Repair ID check | Scoped token rules | Auth prompt | Scoped token safe | Offline banner | Retry track | `mobile/tests/security.test.mjs` | COMPLETE |
| FE-19 | `mobile/account` | Customer | `POST /api/auth/logout` | SecureStore Clear | Submitting | N/A | N/A | N/A | Sign-in prompt | N/A | Offline banner | Retry logout | `mobile/tests/security.test.mjs` | COMPLETE |

---

## Tooling & Verification Pipeline

All verification commands pass cleanly with 0 errors/warnings:

```bash
pnpm api:check
pnpm type-check
pnpm lint
pnpm test:unit
pnpm test:integration
pnpm build
pnpm test:e2e
pnpm test:a11y
pnpm security:scan
pnpm mobile:validate
pnpm mobile:type-check
pnpm mobile:test
```

## Environment Configuration

| Variable | Purpose | Location |
| --- | --- | --- |
| `BACKEND_URL` | Server-only backend origin | `.env.example` |
| `NEXT_PUBLIC_SITE_URL` | Canonical public site URL | `.env.example` |
| `API_SMOKE_URL` | Post-deploy API smoke health check target | `.env.example` |
| `VERCEL_SMOKE_URL` | Post-deploy frontend Vercel smoke target | `.env.example` |
| `EXPO_PUBLIC_BACKEND_URL` | Mobile application API origin | `.env.example`, `mobile/.env.example` |

Vercel project: `sanfaani-store`
Production URL: `https://sanfaani-store.vercel.app`
Preview behavior: Branch previews operate in isolated environments without production secrets.
