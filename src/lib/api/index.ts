/**
 * Canonical Deep API Client & Auth Transport Module
 * 
 * Exposes a strongly-typed, domain-driven API surface.
 * Encapsulates refresh deduplication, scoped tracking headers,
 * idempotency key injection, and standard error envelope decoding.
 */

import { apiClient, setRuntimeAccessToken, getRuntimeAccessToken, configureSessionRecovery, ApiError, errorMessage } from "./client";
import * as authApi from "./authApi";
import * as cartApi from "./cartApi";
import * as checkoutApi from "./checkoutApi";
import * as ordersApi from "./ordersApi";
import * as repairsApi from "./repairsApi";
import * as guidanceApi from "./guidanceApi";
import * as productsApi from "./productsApi";
import * as warrantyApi from "./warrantyApi";
import * as supportApi from "./supportApi";
import * as notificationApi from "./notificationApi";
import * as evidenceApi from "./evidenceApi";
import * as paymentsApi from "./paymentsApi";

export { ApiError, errorMessage, setRuntimeAccessToken, getRuntimeAccessToken, configureSessionRecovery };

export const api = {
  auth: authApi,
  cart: cartApi,
  checkout: checkoutApi,
  orders: ordersApi,
  repairs: repairsApi,
  guidance: guidanceApi,
  products: productsApi,
  warranty: warrantyApi,
  support: supportApi,
  notifications: notificationApi,
  evidence: evidenceApi,
  payments: paymentsApi,
  /** Lower-level HTTP escape hatch for custom requests */
  raw: apiClient,
};

export default api;
