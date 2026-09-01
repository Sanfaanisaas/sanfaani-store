# Route-to-PRD matrix (Phase 1)

Captured frontend `main` against backend `Sanfaanisaas/sanfaani-storebackend` public customer routes. Backend absence is verified in source before marking unavailable.

| route | audience | ticket/PRD domain | data source | authentication | role requirement | loading state | empty state | validation state | unauthorized state | forbidden state | unavailable state | test coverage | current completion status | known dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Public | FE-14 | Static/marketing | None | None | N/A | N/A | N/A | N/A | N/A | N/A | `e2e/public-journeys`, `e2e/route-integrity` | Complete | None |
| `/shop` | Public | FE-03 | `GET /products` + URL filters | None | None | Yes | Yes | Invalid URL filters fall back | N/A | N/A | API error retry | `tests/unit/catalogue-params`, `e2e/phase1-journeys` | Complete (client-side filters; backend list supports page/limit only) | Backend catalogue query filters |
| `/shop/[id]` | Public | FE-03 | `GET /products/{slug}` | None | None | Yes | Not found | Variant validation | N/A | N/A | API unavailable | Unit normalizers, manual PDP | Complete | None |
| `/cart` | Guest/customer | FE-04 | Guest storage + `GET/POST/PATCH/DELETE /cart*` | Optional | Customer for sync | Yes | Yes | Quantity bounds | Sign-in prompt for checkout | N/A | Merge/sync errors | `tests/unit/guest-cart-storage`, integration cart | Complete | Live stock revalidation |
| `/checkout` | Customer | FE-05 | `POST /checkout`, `POST /payments/initiate` | Required | Customer | Yes | Empty cart | Address/payment validation | Redirect `/login` | N/A | Conflict/retry | `e2e/phase1-journeys` | Complete | Server shipping quote currently zero |
| `/checkout/return` | Customer | FE-05 | `GET /orders/mine`, `GET /payments/{id}` | Required | Customer | Verifying | N/A | N/A | Redirect `/login` | Foreign order hidden | Provider delay pending | Checkout return flow | Complete | Dedicated order-by-id endpoint |
| `/checkout/confirmation` | Customer | FE-05 | `GET /orders/mine` lookup | Required | Customer | Yes | Missing order | N/A | Redirect `/login` | Foreign order hidden | Pending payment | Confirmation page | Complete | Dedicated order-by-id endpoint |
| `/login`, `/register` | Public | FE-02 | `/auth/login`, `/auth/register`, `/auth/refresh` | Entry | None | Restoring on boot | N/A | Form validation | N/A | N/A | Service unavailable | `tests/integration/session-recovery` | Complete | None |
| `/account` | Customer | FE-02 | Auth session | Required | Customer | Restoring | N/A | N/A | Redirect `/login` | N/A | Unavailable banner | Protected route tests | Complete | None |
| `/account/orders` | Customer | FE-06 | `GET /orders/mine` | Required | Customer | Yes | Yes | N/A | Redirect `/login` | N/A | Retry | Orders list page | Complete | Paginated lookup for detail |
| `/account/orders/[id]` | Customer | FE-06 | `GET /orders/mine` scan, `PATCH /orders/{id}/cancel`, `GET /orders/{id}/receipt` | Required | Owner | Yes | Forbidden safe | Cancel eligibility | Redirect `/login` | Non-owner 404-safe | Receipt unavailable | `tests/unit/order-normalizer` | Complete | `GET /orders/{id}` owner detail |
| `/orders/track` | Customer | FE-14 | Secure entry to `/account/orders/[id]` | Prompt sign-in | Customer | N/A | N/A | Reference required | Login redirect | Foreign order hidden | N/A | `e2e/phase1-journeys` | Complete | None |
| `/repair/request` | Customer | FE-14 entry | Repairs API | Optional | Customer | Yes | N/A | Form validation | Scoped tracking token in memory | Foreign repair hidden | API unavailable | Existing repair tests | Shared infra only | FE-07 scope |
| `/repair/track`, `/repair/track/[id]` | Customer | FE-14 | Repairs track API + in-memory credential | Optional bearer/scoped | Customer | Yes | Not found | Token required when signed out | Safe failure | Foreign repair hidden | API unavailable | Repair track tests | Shared infra only | FE-07 scope |
| `/support` | Customer | FE-10 (out of phase) | Support API | Required | Customer | Yes | Empty | Validation | Redirect `/login` | N/A | API unavailable | Customer ticket tests | Out of Phase 1 | FE-10 |
| `/guides`, `/guides/[slug]` | Public | FE-15 (out of phase) | Repository content | None | None | N/A | Not found | N/A | N/A | N/A | N/A | Content tests | Out of Phase 1 | FE-15 |
| `/policies/*` | Public | FE-00 | Static policy pages | None | None | N/A | N/A | N/A | N/A | N/A | N/A | Route integrity | Complete | None |
| `/operations`, `/operations/admin` | Staff | FE-08 (out of phase) | `GET /dashboard/queue` | Required | Operations roles | Yes | Empty queue | N/A | Redirect `/login` | Forbidden page | API unavailable | `e2e/public-journeys` guard | Out of Phase 1 | FE-08 |

## Commands verified

`lint`, `type-check`, `test`, `test:unit`, `test:integration`, `test:e2e`, `test:a11y`, `build`, `ci`, `api:generate`, `api:check`, `smoke:api`, `smoke:vercel`, `security:scan` — all wired in `package.json` to real scripts.

## Environment

| Variable | Purpose |
| --- | --- |
| `BACKEND_URL` | Server-only API origin for SSR/proxy |
| `NEXT_PUBLIC_SITE_URL` | Canonical public site URL for metadata |
| `API_SMOKE_URL` | Post-deploy health smoke target |
| `VERCEL_SMOKE_URL` | Frontend deployment smoke target |
| Vercel project | `sanfaani-store` |
| Production URL | `https://sanfaani-store.vercel.app` |
| Preview behavior | Isolated branch previews without production secrets |

Never place secrets in `NEXT_PUBLIC_*`.
