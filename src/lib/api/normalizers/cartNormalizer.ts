import type { AvailabilityStatus } from "../contracts";
import { isRecord, readArray, readBoolean, readId, readNumber, readString } from "../validation";

export interface NormalizedCartLine {
  productId: string;
  variantId: string;
  variantSku: string;
  name: string;
  image?: string;
  price: number;
  priceAtAdd: number | null;
  priceChanged: boolean | null;
  quantity: number;
  maxStock?: number;
  availability: AvailabilityStatus;
  canFulfillQuantity: boolean;
}

export interface NormalizedCart {
  items: NormalizedCartLine[];
}

const availabilityValues = new Set(["in_stock", "low_stock", "out_of_stock", "sourcing"]);

function readAvailability(value: unknown): AvailabilityStatus {
  const text = readString(value, "out_of_stock");
  return availabilityValues.has(text) ? (text as AvailabilityStatus) : "out_of_stock";
}

export function normalizeCartLine(value: unknown): NormalizedCartLine {
  const item = isRecord(value) ? value : {};
  const product = isRecord(item.product) ? item.product : {};
  const variant = isRecord(item.variant) ? item.variant : {};
  const productId = readId(item.productId ?? product.id);
  const variantId = readId(item.variantId ?? variant.id);
  const variantSku = readString(item.variantSku ?? variant.sku);
  const price = readNumber(item.price ?? item.currentPrice);
  const priceAtAdd = item.priceAtAdd == null ? null : readNumber(item.priceAtAdd);
  const priceChanged = readBoolean(item.priceChanged) ?? null;
  const quantity = Math.max(1, Math.floor(readNumber(item.quantity, 1)));
  const availability = readAvailability(item.availability);
  const canFulfill = item.canFulfillQuantity === true;

  return {
    productId,
    variantId,
    variantSku,
    name: readString(product.name, "Product"),
    quantity,
    price,
    priceAtAdd,
    priceChanged,
    availability,
    canFulfillQuantity: canFulfill,
    maxStock: canFulfill ? quantity : 0,
  };
}

export function normalizeCart(value: unknown): NormalizedCart {
  const root = isRecord(value) ? value : {};
  return {
    items: readArray(root.items).map(normalizeCartLine).filter((line) => line.variantId && line.variantSku),
  };
}
