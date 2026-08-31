# Frontend Ticket Audit Report

## TICKET 2.3 — /shop listing + /shop/[slug] PDP

- **Verdict**: PARTIAL
- **Status**: Listing and PDP pages exist with working grid, filters, search, and client-side pagination.
- **Next 16 Check**: `[id]/page.tsx` correctly uses the Next 15/16 async pattern with `params: Promise<{ id: string }>` and `use(params)`.
- **Data Shape Mismatch**: `mockGadgets.ts` is structurally INCOMPATIBLE with the expected `Variant` model. It uses an ad-hoc shape (`id`, `name`, `spec`, `price`, `condition`, `status`, `category`) missing `sku`, `attributes`, `in_stock`, `stockQuantity`, and `sourcing` fields required for a drop-in swap.

## TICKET 3.1a — cartSlice, localStorage persistence, merge-on-login trigger

- **Verdict**: PARTIAL
- **Status**: `cartSlice.ts` exists but does not handle persistence internally. `cartActions.ts` manually manages `localStorage.getItem("guestCart")` for unauthenticated users.
- **Merge-on-Login Check**: MISSING. There is no logic in `authSlice.ts` or `cartSlice.ts` to trigger a merge of the guest cart into Redux state upon `loginUser.fulfilled`.

## TICKET 3.4 — /checkout flow: address/pickup selection, itemised summary, 409 recovery UI

- **Verdict**: PARTIAL
- **Status**: `/checkout/page.tsx` exists with address/pickup selection and an itemised order summary.
- **CRITICAL CHECK**: 409 recovery UI is NOT ADDRESSED. The submission logic is a happy-path happy form with zero code handling stock/price-changed rejections or the 409 status code.

## TICKET 4.3b — /account/orders list + detail, status timeline

- **Verdict**: DONE
- **Status**: `/account/orders/page.tsx` provides both a list view and a detail view (side-by-side on desktop). A visual status timeline is implemented and driven by the order status.

## TICKET 5.1b — /repair/request form, explicit non-pre-checked privacy ack

- **Verdict**: DONE
- **Status**: Form exists with all required fields. The privacy acknowledgement checkbox is NOT pre-checked (`useState(false)`), satisfying the explicit-consent requirement.

## TICKET 5.8a — /repair/track/[id] timeline, customer-language status mapping, quote approve/decline UI

- **Verdict**: PARTIAL
- **Status**: Tracking page exists with timeline and quote UI. `params` access correctly follows the Next 16 async pattern.
- **Status Mapping Gap**: `statusMapper.ts` uses an internal enum (`InternalRepairStatus`) that misses several real backend values from `constants.js` (e.g., `quote_sent`, `awaiting_approval`, `approved`, `ready`, `handed_over`).
- **Quote Prop Mismatch**: `quoteApprovalCard.tsx` uses `totalAmount` and `amount` instead of the expected `total` and `lineItems` mentioned in the Quote model spec.

## TICKET 6.1a — /operations shell, role-gated nav

- **Verdict**: PARTIAL
- **Status**: Admin and User operation pages exist and share the same `Sidebar` component. However, there is no shared layout/shell; both pages implement their own mobile headers and menus independently.
- **Role-Gating Check**: NOT ADDRESSED. The audited files do not contain any permission checks (e.g., `req.user.role`). Access is currently purely URL-based.

## TICKET 6.2a — Orders/repairs queue tables/filters

- **Verdict**: PARTIAL
- **Status**: `RepairTable.tsx` and `RepairFilter.tsx` are fully implemented with real state-wired filters.
- **Gap**: Only the Repairs queue is implemented. The ticket's requirement for an equivalent **Orders** queue table is missing.

## TICKET 7.1b — /account/warranty claim submission

- **Verdict**: DONE
- **Status**: A functional claim submission form exists at `/account/warranty/page.tsx`, including device selection and defect category selection.

## TICKET 7.2b — Support ticket UI

- **Verdict**: PARTIAL
- **Status**: `/support/page.tsx` exists and allows ticket creation with file attachments.
- **Missing Features**: It lacks the reply thread and status display components required for a full support UI; it is currently functionally identical to a claim form.

## TICKET 7.3 — 8 policy pages

- **Verdict**: DONE
- **Status**: All 8 files under `/policies/` exist and contain real, appropriate content (not Lorem Ipsum).

## CROSS-CUTTING

- **Mock Data Usage**: `mockGadgets` and `mockData` are extensively used in `Hero.tsx`, `FeaturedGadgets.tsx`, `ProductCard.tsx`, `Shop` pages, and `RepairTrackingPage`.
- **RTK Query**: Not used. All async state management uses plain `createAsyncThunk` and `axios`.

## SECTION 4 COORDINATION POINTS

- **3.2/3.4 (Checkout 409)**: **FAIL.** Lack of 409 handling blocks this from being production-ready.
- **5.4 (Quote Prop Shape)**: **MISMATCH.** `quoteApprovalCard` uses `totalAmount` and `amount`; expected `total` and `lineItems`.
- **5.8 (Status Leak)**: **RISK.** `statusMapper.ts` does not cover all backend statuses, leading to raw internal strings or generic labels being shown to customers for unmapped states.
- **6.1/6.2 (Role Visibility)**: **COSMETIC.** Role-based gating is currently not implemented in the frontend; it relies on the user being at the correct URL.

// Update from Patrick

## Ticket: FE-03 — Catalogue Listing & Product Detail Page (PDP)

### Overview

Addresses all core requirements for FE-03 by migrating `/shop` filtering and pagination from in-memory browser calculations to API-driven queries, introducing dynamic multi-attribute variant resolution on the PDP, and exposing honest catalogue media, inspection summaries, and warranty metadata.

---

### Key Changes

1. **API-Driven Listing & Filtering (`/shop`)**
   - Refactored `fetchProducts` to pass `search`, `category`, `condition`, `sort`, and `type` directly to the backend endpoint.
   - Eliminated client-side array post-filtering to resolve pagination skew.
   - Added sorting selector (`newest`, `price_asc`, `price_desc`, `name_asc`).
   - Added Information Architecture tab segmentation (`All Items`, `Devices & Hardware`, `Curated Bundles`, `Repair Services`).

2. **Multi-Attribute Variant Matrix Resolution (`/shop/[id]`)**
   - Implemented dynamic attribute matching across variant keys (e.g., condition, storage, color, RAM).
   - Dynamically updates price, availability status (`in_stock`, `low_stock`, `sourcing`), and SKU upon attribute selection.
   - Preserved backwards-compatible support for `fetchProducts(page, limit)` positional arguments.

3. **Inspection Summaries, Limitations & Warranty**
   - Added Sanfaani Inspection Summary blocks for refurbished and used device grades.
   - Rendered explicit `limitations` (known physical notes) and `warranty` (`version`, `terms`) badges on PDP and `ProductCard`.

4. **Honest Catalogue Media & Fallbacks**
   - Replaced static placeholder boxes with `next/image` gallery handling `product.images`.
   - Added category-specific fallback icons (`Wrench` for services, `Layers` for bundles, `Package` for hardware) with error boundaries.

---

### Verification & Quality Checks

- [x] `pnpm type-check` (TypeScript strict check: 0 errors)
- [x] `pnpm lint` (ESLint: 0 errors, 0 warnings)
- [x] Manual verification of filter/sort parameter synchronization via URL search params.
- [x] Clean fallback behavior verified for missing media and unavailable variants.

---

### Modified Files

- `src/lib/api/productsApi.ts`
- `src/app/shop/page.tsx`
- `src/app/shop/[id]/page.tsx`
- `src/components/ProductCard.tsx`
