"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { configureSessionRecovery } from "@/lib/api/client";
import { sessionExpired, refreshSession } from "./slices/authSlice";
import { store } from "./store";
import AuthInitializer from "./AuthInitializer";
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => { configureSessionRecovery({ refresh: async () => (await store.dispatch(refreshSession())).meta.requestStatus === "fulfilled", onExpired: () => store.dispatch(sessionExpired()) }); }, []);
  return <Provider store={store}><AuthInitializer>{children}</AuthInitializer></Provider>;
}
