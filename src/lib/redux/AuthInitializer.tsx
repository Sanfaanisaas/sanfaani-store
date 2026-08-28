"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { refreshSession } from "./slices/authSlice";
import type { AppDispatch } from "./store";
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => { void dispatch(refreshSession()); }, [dispatch]);
  return <>{children}</>;
}
