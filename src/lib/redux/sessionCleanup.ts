import type { AppDispatch } from "@/lib/redux/store";
import { clearCart } from "@/lib/redux/slices/cartSlice";
import { clearAllCartState } from "@/lib/functions/cartSync";

export function clearPrivateCustomerState(dispatch: AppDispatch) {
  clearAllCartState(dispatch);
  dispatch(clearCart());
}
