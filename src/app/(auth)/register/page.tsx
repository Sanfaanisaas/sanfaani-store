"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AppDispatch, RootState } from "@/lib/redux/store";
import { registerUser, loginUser } from "@/lib/redux/slices/authSlice";

export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { status, error } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await dispatch(registerUser({ name, email, password, phone }));
    if (registerUser.fulfilled.match(result)) {
      const loginResult = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(loginResult)) {
        router.push("/account");
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display text-xl font-semibold text-ink">
          Sanfaani<span className="text-gold">.</span>
        </Link>

        <h1 className="mt-8 font-display text-2xl font-semibold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-mist">Join Sanfaani Store & Repair.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink/80">
              Full name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-navy-900/15 px-4 py-2 text-sm text-ink focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-navy-900/15 px-4 py-2 text-sm text-ink focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink/80">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-navy-900/15 px-4 py-2 text-sm text-ink focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink/80">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-navy-900/15 px-4 py-2 text-sm text-ink focus:border-gold focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-full bg-navy-900 px-6 py-3 text-sm font-medium text-paper hover:bg-navy-800 disabled:opacity-60"
          >
            {status === "loading" ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-mist">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}