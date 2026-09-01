export const GUEST_CART_KEY = "guestCart";

export interface GuestCartStoredItem {
  variantId: string;
  quantity: number;
}

export function parseGuestCartStorage(raw: string | null): GuestCartStoredItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const item = entry as Record<string, unknown>;
        const variantId = typeof item.variantId === "string" ? item.variantId.trim() : "";
        const quantity = typeof item.quantity === "number" && Number.isInteger(item.quantity) ? item.quantity : 0;
        if (!variantId || quantity < 1 || quantity > 99) return null;
        return { variantId, quantity };
      })
      .filter((item): item is GuestCartStoredItem => item !== null);
  } catch {
    return [];
  }
}

export function readGuestCartStorage(): GuestCartStoredItem[] {
  if (typeof window === "undefined") return [];
  return parseGuestCartStorage(window.localStorage.getItem(GUEST_CART_KEY));
}

export function writeGuestCartStorage(items: GuestCartStoredItem[]) {
  if (typeof window === "undefined") return;
  if (!items.length) {
    window.localStorage.removeItem(GUEST_CART_KEY);
    return;
  }
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function clearGuestCartStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_CART_KEY);
}
