# Backend Integration Audit Report

This document audits the current Sanfaani frontend implementation against the real backend contracts found in the `sanfaani-storebackend` repository.

## Real Backend Contracts (Ground Truth)

The following endpoints and shapes were confirmed by direct inspection of the backend source code:

| Domain | REAL Route Paths | Response Shape (toPublic) |
|--------|------------------|---------------------------|
| Auth | `/auth/register`, `/login`, `/refresh`, `/logout` | Standard user/token response |
| Products | `GET /api/products`, `GET /api/products/:slug` | `{ id, name, description, category, variants: [{ sku, attributes, price, condition, inStock, sourcing: { leadTimeDays } }] }` |
| Cart | `GET /api/cart`, `POST /api/cart/items`, `DELETE /api/cart/items/:variantSku`, `POST /api/cart/merge` | `{ items: [{ variantId, name, price, quantity, sku }] }` |
| Checkout | `POST /api/checkout` | Order details |
| Orders | `GET /api/orders/mine` | `[{ id, items: [{ sku, name, price, quantity }], shippingAddress, total, status, paymentStatus, createdAt }]` |
| Payments | `POST /api/payments/initiate` | `{ authorization_url, reference }` |
| Repairs | `POST /api/repairs`, `GET /api/repairs/:id/track` | `{ id, status, device: { type, brand, model }, timeline: { createdAt, updatedAt }, quoteTotal }` |
| Warranty | `POST /api/warranties/:id/claims` | Claim details |
| Claims | `GET /api/claims/mine` | List of claims |
| Dashboard | `GET /api/dashboard/queue` | Branched by role (Admin/Tech/Customer) |
| Support | `GET /api/support-tickets/mine`, `POST /api/support-tickets`, `POST /api/support-tickets/:id/reply` | Ticket details |

---

## File-by-File Audit

| File | Current data source | Target endpoint | Shape match? | Gap / action needed |
|------|---------------------|-----------------|--------------|---------------------|
| `src/app/shop/page.tsx` | `mockGadgets` | `GET /api/products` | PARTIAL | Frontend needs to handle nested `variants` and map `MockGadget.id` to `Product.slug`. |
| `src/app/shop/[id]/page.tsx` | `mockGadgets` | `GET /api/products/:slug` | PARTIAL | ID in URL should be slug. Needs to handle variant selection (price/stock varies by variant). |
| `src/components/ProductCard.tsx` | `MockGadget` prop | N/A (UI only) | PARTIAL | Update props to match `toPublicObject` Product/Variant structure. |
| `src/lib/redux/slices/cartSlice.ts` | Local state | `GET /api/cart` | PARTIAL | `variantId` vs `variantSku`. Backend uses `sku` for item identification in routes. |
| `src/lib/functions/cartActions.ts` | LocalStorage/Mock | `POST /api/cart/items` | PARTIAL | Requires `variantSku` for adding items. `buildCartItem` uses `gadget.id`. |
| `src/app/checkout/page.tsx` | Local State | `POST /api/checkout` | PARTIAL | Needs to map frontend `paymentMethod` to backend `PaymentChannel` constants. |
| `src/app/account/orders/page.tsx` | `const orders` | `GET /api/orders/mine` | MATCHES | Mock fields (id, total, status) align with `toPublicOrder`. |
| `src/app/account/warranty/page.tsx` | `MOCK_WARRANTIES` | **NO ENDPOINT** | NO ENDPOINT EXISTS | **Backend Gap:** No endpoint for listing customer warranties. |
| `src/app/repair/request/page.tsx` | `RepairPayload` | `POST /api/repairs` | MATCHES | `device` and `privacyAcknowledged` match backend `createRepairSchema`. |
| `src/app/repair/track/[id]/page.tsx` | Mock State | `GET /api/repairs/:id/track` | MATCHES | Matches `toPublicRepair` fields. |
| `src/app/repair/track/[id]/utils/statusMapper.ts` | Hardcoded Statuses | N/A | MATCHES | Statuses (diagnosing, ready, etc.) match backend `REPAIR_STATUS`. |
| `src/lib/redux/slices/repairSlice.ts` | `axios.post("/api/repairs")`| `POST /api/repairs` | MATCHES | FormData handling aligns with backend `upload.array("intakePhotos")`. |
| `src/lib/mockData/mockupRepair.ts` | `mockRepairs` | `GET /api/repairs/queue` | PARTIAL | Mock uses `submittedAt`, backend uses `createdAt`. |
| `src/components/RepairTable.tsx` | Prop `repairs` | N/A | PARTIAL | Ensure consumer maps backend `_id` to `id`. |
| `src/components/RepairFilter.tsx` | Local State | N/A | MATCHES | Filters (status, priority) align with constants. |
| `src/components/StatusBadge.tsx` | Prop `status` | N/A | MATCHES | |
| `src/components/quoteApprovalCard.tsx` | Mock | `PATCH /api/repairs/:id/quote` | MATCHES | Backend has `approveQuote`/`rejectQuote` routes. |
| `src/components/repairTimeline.tsx` | Prop `steps` | N/A | MATCHES | Mapping `updatedAt` to timeline events is needed. |
| `src/components/statusBanner.tsx` | Prop `status` | N/A | MATCHES | |
| `src/app/operations/admin/page.tsx` | `MOCK_PRODUCTS` | `GET /api/products` | PARTIAL | Admin view needs cost price/supplier which are filtered from public view. |
| `src/app/operations/user/page.tsx` | `mockRepairs` | `GET /api/dashboard/queue` | MATCHES | |
| `src/components/sidebar.tsx` | Role-based links | `GET /api/dashboard/queue` | MATCHES | Role names (customer, technician, admin) match. |
| `src/app/support/page.tsx` | `SupportTicket` | `GET /api/support-tickets/mine` | MATCHES | Fields (id, subject, status, priority) match backend model. |

---

## Backend Gaps Discovered

1. **GET /api/warranties/mine**: The frontend `account/warranty` page expects to list all warranties for the logged-in user. The backend only implements specific claim creation/tracking but lacks a listing endpoint for warranties.
2. **Variant vs Product in Search**: Backend routes return Products with a `variants` array. Frontend `Shop` currently treats each item as a flat `Gadget`. A mapping layer or a backend "flat" view is needed for the Shop listing.
3. **Cart Item Identifier**: Frontend uses `variantId` (ObjectId) in its cart slice, but backend cart routes (`DELETE /items/:variantSku`) prefer `sku`. This will cause mismatch during deletion if not aligned.
4. **Repair Priority**: Backend `Repair` model does not explicitly store a `priority` field (it's handled by business logic/queue), but frontend `mockRepairs` and `RepairTable` display it.

---

## Conclusion
Most critical contracts (Auth, Repairs, Products) are well-aligned. The primary blocker for integration is the missing **Warranty Listing** endpoint and the **Cart SKU vs ID** discrepancy.
