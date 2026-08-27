# Sanfaani Store — Frontend

Next.js frontend for the Sanfaani Store & Repair platform. This app handles product browsing, cart management, checkout/payment flows, order tracking, repair tracking, and account management.

## Stack

- Next.js (App Router)
- React + TypeScript
- Redux Toolkit (cart, auth, repair)
- Tailwind CSS
- Axios (via rewrite proxy to backend)

## Prerequisites

- Node.js 18+
- Backend server running (default: `http://localhost:5000`)

## Environment

Create `.env` in this directory:

```
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_DEV_AUTH=true   # optional: enables dev-only mock login
```

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Dev Auth

If `NEXT_PUBLIC_DEV_AUTH=true`, the login page accepts any email/password and issues a mock token. No backend required. Set it to `false` or remove it to use real auth.

## Key Routes

| Route | Purpose |
|-------|---------|
| `/` | Hero, featured products, waitlist |
| `/shop` | Product listing |
| `/shop/[id]` | Product detail |
| `/cart` | Cart with quantity controls |
| `/checkout` | Delivery/pickup, payment method, address form |
| `/account/orders` | Order history and details |
| `/repair/track` | Repair tracking entry |
| `/repair/track/[id]` | Repair status detail |

## State

- `cartSlice` — Redux cart; guest items hydrate from `localStorage`, authenticated items sync with backend
- `authSlice` — Login, refresh, logout, guest cart merge on login
- `repairSlice` — Repair requests and quotes

## Cart Flow

1. **Guest**: items persist to `localStorage` under `guestCart`.
2. **Login**: `mergeGuestCart` posts guest items to `/cart/merge`, clears `localStorage`, then fetches server cart into Redux.
3. **Authenticated**: add/update/remove dispatches to Redux and writes to `/cart/items`. Conflicts (stock/price) surface from backend `409` responses.

## Checkout Flow

1. Client submits `paymentMethod`, `fulfillmentMode`, and address.
2. Backend validates stock, price, idempotency, and pay-on-pickup eligibility.
3. Returns order + Paystack authorization URL (or pending status for bank transfer / pay-on-pickup).
4. Frontend redirects to Paystack; return page polls `/orders/mine` or `/payments/:paymentId` for real status.
5. Bank transfer and pay-on-pickup show pending-state UX with receipt upload guidance.

## Order Flow

- Orders list fetched from `GET /orders/mine`.
- Detail view shows customer timeline, next actions, and receipt download.
- Internal notes are never exposed in the UI.

## Backend Proxy

Next.js rewrites `/api/*` to `BACKEND_URL/api/*` in `next.config.ts`. Axios baseURL is `/api` in the browser, so requests are same-origin and avoid CORS.

## Corrections Applied

- Replaced hardcoded delivery total with backend-authoritative quote.
- Added fulfillment mode and conditional address validation.
- Made Paystack return safe (no success declared from callback alone).
- Added idempotency key handling for checkout and payment.
- Replaced mock orders with `GET /orders/mine`.
- Added receipt download and pending payment states.
- Fixed hero CTA href to `/shop`.
- Added mobile drawer focus trap, Escape-to-close, and reduced-motion support.
