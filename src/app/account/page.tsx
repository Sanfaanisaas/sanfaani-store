"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import { logoutUser } from "@/lib/redux/slices/authSlice";

export default function AccountOverviewPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  async function handleLogout() {
    await dispatch(logoutUser());
    router.push("/login");
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Welcome back{user?.name ? `, ${user.name}` : ""}
      </h1>
      <p className="mt-2 text-sm text-mist">{user?.email}</p>
      <button
        onClick={handleLogout}
        className="mt-8 rounded-full bg-navy-900 px-6 py-3 text-sm font-medium text-paper hover:bg-navy-800"
      >
        Log out
      </button>
    </main>
  );
}