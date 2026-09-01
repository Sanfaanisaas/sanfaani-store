"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";
import { hydrateGuestCart, mergeGuestIntoAuthenticatedCart } from "@/lib/functions/cartSync";

export default function CartInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, initialized, phase } = useSelector((state: RootState) => state.auth);
  const guestMerged = useSelector((state: RootState) => state.cart.guestMerged);

  useEffect(() => {
    if (!initialized || phase === "restoring") return;
    if (isAuthenticated) {
      void mergeGuestIntoAuthenticatedCart(dispatch, guestMerged);
      return;
    }
    void hydrateGuestCart(dispatch);
  }, [dispatch, guestMerged, initialized, isAuthenticated, phase]);

  return <>{children}</>;
}
