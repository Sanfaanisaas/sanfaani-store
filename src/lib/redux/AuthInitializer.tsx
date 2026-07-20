"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./store";
import { refreshSession } from "./slices/authSlice";

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(refreshSession());
  }, [dispatch]);

  return <>{children}</>;
}