"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/redux/slices/authSlice";
import type { AppDispatch, RootState } from "@/lib/redux/store";
export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>(); const router = useRouter(); const { status, error } = useSelector((state: RootState) => state.auth); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const result = await dispatch(loginUser({ email, password })); if (loginUser.fulfilled.match(result)) router.replace("/account"); }
  return <main className="mx-auto grid min-h-screen max-w-md place-items-center px-6"><form onSubmit={submit} className="w-full space-y-5 rounded-3xl border border-navy-900/10 bg-white p-7 shadow-sm"><div><h1 className="font-display text-3xl font-semibold text-ink">Welcome back</h1><p className="mt-2 text-sm text-mist">Sign in to securely manage orders and repairs.</p></div>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}<label className="block text-sm font-semibold text-ink">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2" /></label><label className="block text-sm font-semibold text-ink">Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-navy-900/20 px-3 py-2" /></label><button disabled={status === "loading"} className="w-full rounded-full bg-gold px-5 py-3 font-semibold text-navy-900 disabled:opacity-60">{status === "loading" ? "Signing in…" : "Sign in"}</button><p className="text-center text-sm text-mist">New to Sanfaani? <Link className="font-semibold text-blue underline" href="/register">Create an account</Link></p></form></main>;
}
