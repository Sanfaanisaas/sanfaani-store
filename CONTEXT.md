# Domain Glossary & Architecture Seams

## Core Domain Vocabulary

### Customer Operations
Manages the end-to-end commerce lifecycle for customers, including Cart management, Server-authoritative Checkout Quotes, Payment processing, Order fulfillment tracking, Warranty claims, and Return processing.

### Repair & Guidance Lifecycle
Handles device repair tracking with one-time credentials, public projection data filtering, guidance sessions, resume token management (`X-Guidance-Resume-Token`), and advisor escalations.

### Catalog & Inventory
Controls product definitions, variant SKU configurations, inventory unit allocations, store locations, and immutable price-at-add snapshots.

### Support & Staff Management
Manages customer support ticket threads, real-time staff notifications, procurement request handling, and recurring maintenance plans.

---

## Architectural Seams & Deep Modules

### API Client & Auth Transport Module (`src/lib/api/index.ts`)
- **Type**: Deep Network Module (Frontend)
- **Interface**: Strongly-typed domain client (`auth`, `cart`, `orders`, `repairs`, `guidance`, `support`, `warranties`)
- **Encapsulated Implementation**:
  - Auth token refresh lock & deduplication engine (prevents 401 refresh storms).
  - Scoped transport header injector (`X-Repair-Tracking-Token`, `X-Guidance-Resume-Token`).
  - `Idempotency-Key` preservation across retries.
  - Standard error envelope decoder (`401`, `403`, `404`, `409`, `422`, `429`).
