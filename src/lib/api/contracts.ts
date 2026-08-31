/**
 * Generated-contract surface. The source snapshot is contracts/api-contract.json,
 * captured from the backend Swagger/OpenAPI 3.1 definition (version 1.0.0).
 * Run pnpm api:check in CI to make sure this surface still agrees with it.
 */
export const API_CONTRACT_VERSION = "1.0.0" as const;
export const STATUS_CONTRACT_VERSION = "2026-08-26" as const;
export const ORDER_STATUS = [
  "draft",
  "pending",
  "pending_payment",
  "paid",
  "processing",
  "ready_for_pickup",
  "dispatched",
  "delivered",
  "completed",
  "cancelled",
  "returned",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];
export const PAYMENT_STATUS = [
  "initiated",
  "pending",
  "confirmed",
  "failed",
  "cancelled",
  "refunded",
  "partially_refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];
export const REPAIR_STATUS = [
  "REQUESTED",
  "INTAKE_PENDING",
  "INTAKE_SCHEDULED",
  "RECEIVED",
  "IN_CUSTODY",
  "DIAGNOSING",
  "QUOTE_PENDING",
  "QUOTE_SENT",
  "AWAITING_APPROVAL",
  "APPROVED",
  "AWAITING_PARTS",
  "IN_REPAIR",
  "PAUSED",
  "QC_PENDING",
  "QC",
  "READY",
  "READY_FOR_PICKUP",
  "HANDED_OVER",
  "COMPLETED",
  "DECLINED",
  "CANCELLED",
] as const;
export type RepairStatus = (typeof REPAIR_STATUS)[number];
export const QUOTE_STATUS = [
  "DRAFT",
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "SUPERSEDED",
] as const;
export type QuoteStatus = (typeof QUOTE_STATUS)[number];
export const AVAILABILITY_STATUS = [
  "in_stock",
  "low_stock",
  "out_of_stock",
  "sourcing",
] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUS)[number];
export const PRODUCT_CONDITION = [
  "new",
  "refurbished_grade_a",
  "refurbished_grade_b",
  "used_grade_a",
  "used_grade_b",
] as const;
export type ProductCondition = (typeof PRODUCT_CONDITION)[number];
export const USER_ROLES = [
  "customer",
  "sales_advisor",
  "store_operator",
  "technician",
  "qc_officer",
  "inventory_officer",
  "support_officer",
  "finance_officer",
  "merchandiser",
  "ops_manager",
  "product_admin",
  "tech_admin",
  "super_admin",
] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const OPERATIONS_ROLES = [
  "sales_advisor",
  "store_operator",
  "technician",
  "qc_officer",
  "inventory_officer",
  "support_officer",
  "finance_officer",
  "ops_manager",
  "product_admin",
  "tech_admin",
  "super_admin",
] as const satisfies readonly UserRole[];
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
}
export interface AuthSession {
  accessToken: string;
  user: ApiUser;
}
export interface ApiPagination {
  total: number;
  page: number;
  limit?: number;
  pages: number;
}
export interface PublicVariant {
  id: string;
  sku: string;
  attributes: Record<string, unknown>;
  price: number;
  condition: ProductCondition;
  availability: AvailabilityStatus;
  limitations?: string;
  warranty?: { version: string; terms: string };
  conditionEvidence?: Array<{ url: string; alt?: string }>;
}
export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  images: string[];
  tags?: string[];
  isFeatured?: boolean;
  seo?: Record<string, unknown>;
  variants: PublicVariant[];
}
export interface ProductListResponse {
  products: PublicProduct[];
  pagination: ApiPagination;
}
export interface PublicQuote {
  id: string;
  version: number;
  lineItems: Array<{ description: string; amount: number }>;
  totalAmount: number;
  estimatedDays: number;
  status: QuoteStatus;
  expiresAt?: string;
}
export interface PublicRepairTracking {
  id: string;
  status: RepairStatus;
  nextAction: string;
  updatedAt: string;
  quote: PublicQuote | null;
}
export interface RepairQueueItem {
  id: string;
  status: RepairStatus;
  dueAt?: string | null;
  blockerCode?: string | null;
  blockerMessage?: string | null;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  assignedTo?: string | { id?: string; name?: string } | null;
  updatedAt: string;
  device?: { type?: string; brand?: string; model?: string };
}
export interface DashboardQueueItem {
  id: string;
  type:
    | "REPAIR"
    | "QUOTE"
    | "INVENTORY"
    | "ORDER"
    | "PAYMENT"
    | "REFUND"
    | "RECONCILIATION"
    | "SUPPORT";
  status: string;
  dueAt?: string | null;
  slaMinutesRemaining?: number | null;
  slaState?: "BREACHED" | "ON_TRACK" | "UNSPECIFIED";
  blocked?: boolean;
  blockerCode?: string | null;
  blockerMessage?: string | null;
  priority?: string;
  assignedTo?: string | null;
  updatedAt: string;
  allowedActions?: string[];
}
export interface WarrantyRecord {
  id: string;
  repair?: string;
  deviceSummary?: string;
  status?: string;
  expiresAt: string;
  termsVersion?: string;
}
export interface SupportTicket {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  updatedAt: string;
  messages?: Array<{ body: string; createdAt?: string }>;
}
export interface AccountSessionRecord {
  id: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  deviceLabel: string;
  current: boolean;
  revoked: boolean;
}
export interface ApiEnvelope<T> {
  success: true;
  data: T;
  pagination?: ApiPagination;
  requestId?: string;
}
export interface ApiFailureEnvelope {
  success: false;
  message?: string;
  errors?: Array<{ code?: string; message?: string; path?: string }> | null;
  requestId?: string;
}
