"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { configureSessionRecovery } from "@/lib/api/client";
import { sessionExpired, refreshSession } from "./slices/authSlice";
import { clearPrivateCustomerState } from "./sessionCleanup";
import { store } from "./store";
import AuthInitializer from "./AuthInitializer";
import CartInitializer from "./CartInitializer";
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    configureSessionRecovery({
      refresh: async () => (await store.dispatch(refreshSession())).meta.requestStatus === "fulfilled",
      onExpired: () => {
        clearPrivateCustomerState(store.dispatch);
        store.dispatch(sessionExpired());
      },
    });
  }, []);
  return <Provider store={store}><AuthInitializer><CartInitializer>{children}</CartInitializer></AuthInitializer></Provider>;
}
