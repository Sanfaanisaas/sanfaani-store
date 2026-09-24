"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import type { FormEvent, InputHTMLAttributes } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";

import { loginUser, registerUser } from "@/lib/redux/slices/authSlice";

import type { AppDispatch, RootState } from "@/lib/redux/store";

export default function UnifiedAuthPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();

  const { status, error } = useSelector((state: RootState) => state.auth);

  const [isLogin, setIsLogin] = useState(pathname !== "/register");
  const [mounted, setMounted] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handlePopState = () => {
      setIsLogin(window.location.pathname !== "/register");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const changeMode = (mode: "login" | "register") => {
    const nextIsLogin = mode === "login";

    setIsLogin(nextIsLogin);

    window.history.pushState(null, "", nextIsLogin ? "/login" : "/register");
  };

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await dispatch(
      loginUser({
        email: loginEmail,
        password: loginPassword,
      }),
    );

    if (loginUser.fulfilled.match(result)) {
      router.replace("/account");
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!acceptedTerms) return;

    const result = await dispatch(
      registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
      }),
    );

    if (registerUser.fulfilled.match(result)) {
      const loginResult = await dispatch(
        loginUser({
          email: regEmail,
          password: regPassword,
        }),
      );

      if (loginUser.fulfilled.match(loginResult)) {
        router.replace("/account");
      }
    }
  }

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (regPassword.length >= 8) score++;
    if (/[A-Z]/.test(regPassword)) score++;
    if (/[0-9]/.test(regPassword)) score++;
    if (/[^A-Za-z0-9]/.test(regPassword)) score++;

    return score;
  }, [regPassword]);

  if (!mounted) return null;

  const loading = status === "loading";

  return (
    <main className="min-h-screen bg-[#f6f7f8] text-slate-900">
      {/* =========================================================
          DESKTOP
      ========================================================== */}

      <div className="hidden min-h-screen lg:grid lg:grid-cols-[42%_58%]">
        {/* ================= BRAND SIDE ================= */}

        <section className="relative overflow-hidden bg-[#0a1728]">
          {/* Very subtle image treatment */}
          <Image
            src="/hero.png"
            alt=""
            fill
            priority
            className="pointer-events-none object-contain object-center opacity-[0.09]"
          />

          <div className="absolute inset-0 bg-[#0a1728]/75" />

          <div className="relative z-10 flex h-full flex-col p-12 xl:p-16">
            <Link href="/" className="inline-flex w-fit">
              <Image
                src="/logo.webp"
                alt="Sanfaani"
                width={52}
                height={52}
                className="rounded-lg"
              />
            </Link>

            <div className="my-auto max-w-xl">
              <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
                Sanfaani
              </p>

              <h1 className="max-w-lg font-display text-5xl font-bold leading-[1.02] tracking-[-0.035em] text-white xl:text-6xl">
                Technology you can
                <span className="block text-yellow-300">rely on.</span>
              </h1>

              <p className="mt-6 max-w-md text-[15px] leading-7 text-white/55">
                Access your purchases, devices and support from one account.
              </p>

              <div className="mt-10 h-px w-20 bg-white/20" />

              <p className="mt-5 text-xs leading-5 text-white/35">
                Secure account access for Sanfaani customers.
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/30">
              <span>© {new Date().getFullYear()} Sanfaani</span>

              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Secure connection
              </span>
            </div>
          </div>
        </section>

        {/* ================= FORM SIDE ================= */}

        <section className="flex min-h-screen items-center justify-center px-10 py-12 xl:px-24">
          <div className="w-full max-w-[440px]">
            {/* Header */}
            <div className="mb-10 flex items-center justify-between">
              <Link
                href="/"
                className="text-xs font-semibold text-slate-400 transition-colors hover:text-slate-800"
              >
                ← Back home
              </Link>

              <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                <LockKeyhole size={12} />
                Secure
              </div>
            </div>

            {/* ================= MODE SWITCH ================= */}

            <div className="mb-8 border-b border-slate-200">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => changeMode("login")}
                  className={`relative mr-8 pb-3 text-sm font-semibold transition-colors ${
                    isLogin
                      ? "text-[#0a1728]"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Sign in
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#0a1728] transition-all duration-500 ${
                      isLogin ? "w-full" : "w-0"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => changeMode("register")}
                  className={`relative pb-3 text-sm font-semibold transition-colors ${
                    !isLogin
                      ? "text-[#0a1728]"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Create account
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#0a1728] transition-all duration-500 ${
                      !isLogin ? "w-full" : "w-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* ================= FORM VIEWPORT ================= */}

            <div className="relative overflow-hidden">
              {/* =================================================
                  LOGIN
              ================================================== */}

              <div
                className={`transition-all duration-500 ease-out ${
                  isLogin
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-10 opacity-0 pointer-events-none absolute inset-0"
                }`}
              >
                <div className="mb-8">
                  <h2 className="font-display text-4xl font-bold tracking-[-0.03em] text-[#0a1728]">
                    Welcome back
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Sign in to continue to your account.
                  </p>
                </div>

                {isLogin && error && <ErrorMessage error={error} />}

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <FormField
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={setLoginEmail}
                  />

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-600">
                        Password
                      </label>

                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-slate-400 hover:text-[#0a1728]"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <PasswordField
                      value={loginPassword}
                      onChange={setLoginPassword}
                      visible={showLoginPassword}
                      setVisible={setShowLoginPassword}
                      autoComplete="current-password"
                    />
                  </div>

                  <SubmitButton loading={loading} label="Sign in" />
                </form>

                <p className="mt-8 text-center text-sm text-slate-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => changeMode("register")}
                    className="font-semibold text-[#0a1728] hover:underline"
                  >
                    Create one
                  </button>
                </p>
              </div>

              {/* =================================================
                  REGISTER
              ================================================== */}

              <div
                className={`transition-all duration-500 ease-out ${
                  !isLogin
                    ? "translate-x-0 opacity-100"
                    : "translate-x-10 opacity-0 pointer-events-none absolute inset-0"
                }`}
              >
                <div className="mb-8">
                  <h2 className="font-display text-4xl font-bold tracking-[-0.03em] text-[#0a1728]">
                    Create your account
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    A few details and you're ready to go.
                  </p>
                </div>

                {!isLogin && error && <ErrorMessage error={error} />}

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <FormField
                    label="Full name"
                    type="text"
                    placeholder="Your full name"
                    value={regName}
                    onChange={setRegName}
                  />

                  <FormField
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={setRegEmail}
                  />

                  <FormField
                    label="Phone number"
                    type="tel"
                    placeholder="+237 6XX XXX XXX"
                    value={regPhone}
                    onChange={setRegPhone}
                    required={false}
                  />

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">
                      Password
                    </label>

                    <PasswordField
                      value={regPassword}
                      onChange={setRegPassword}
                      visible={showRegPassword}
                      setVisible={setShowRegPassword}
                      autoComplete="new-password"
                    />

                    {regPassword && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <span
                              key={level}
                              className={`h-1 flex-1 rounded-sm transition-colors ${
                                level <= passwordStrength
                                  ? "bg-emerald-500"
                                  : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>

                        <p className="mt-2 text-[11px] text-slate-400">
                          {passwordStrength < 2
                            ? "Use at least 8 characters."
                            : passwordStrength < 4
                              ? "Add a number, uppercase letter and symbol."
                              : "Good password."}
                        </p>
                      </div>
                    )}
                  </div>

                  <label className="flex items-start gap-3 pt-1">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#0a1728]"
                    />

                    <span className="text-xs leading-5 text-slate-400">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="font-medium text-slate-600 hover:text-[#0a1728]"
                      >
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="font-medium text-slate-600 hover:text-[#0a1728]"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>

                  <SubmitButton
                    loading={loading}
                    label="Create account"
                    disabled={!acceptedTerms}
                  />
                </form>

                <p className="mt-8 text-center text-sm text-slate-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => changeMode("login")}
                    className="font-semibold text-[#0a1728] hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ==========================================================
          MOBILE
      =========================================================== */}

      <div className="flex min-h-screen flex-col lg:hidden">
        <header className="flex items-center justify-between px-6 py-5">
          <Link href="/">
            <Image
              src="/logo.webp"
              alt="Sanfaani"
              width={46}
              height={46}
              className="rounded-lg"
            />
          </Link>

          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            <LockKeyhole size={12} />
            Secure
          </span>
        </header>

        <main className="flex flex-1 items-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile switch */}

            <div className="mb-9 border-b border-slate-200">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => changeMode("login")}
                  className={`relative mr-8 pb-3 text-sm font-semibold ${
                    isLogin ? "text-[#0a1728]" : "text-slate-400"
                  }`}
                >
                  Sign in
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#0a1728] transition-all duration-500 ${
                      isLogin ? "w-full" : "w-0"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => changeMode("register")}
                  className={`relative pb-3 text-sm font-semibold ${
                    !isLogin ? "text-[#0a1728]" : "text-slate-400"
                  }`}
                >
                  Create account
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#0a1728] transition-all duration-500 ${
                      !isLogin ? "w-full" : "w-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Forms */}

            <div className="relative overflow-hidden">
              <div
                className={`transition-all duration-500 ease-out ${
                  isLogin
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-8 opacity-0 pointer-events-none absolute inset-0"
                }`}
              >
                <h1 className="font-display text-4xl font-bold tracking-tight text-[#0a1728]">
                  Welcome back
                </h1>

                <p className="mt-3 text-sm text-slate-500">
                  Sign in to continue to your account.
                </p>

                {isLogin && error && (
                  <div className="mt-6">
                    <ErrorMessage error={error} />
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="mt-8 space-y-5">
                  <FormField
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={setLoginEmail}
                  />

                  <div>
                    <div className="mb-2 flex justify-between">
                      <label className="text-xs font-semibold text-slate-600">
                        Password
                      </label>

                      <Link
                        href="/forgot-password"
                        className="text-xs text-slate-400"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <PasswordField
                      value={loginPassword}
                      onChange={setLoginPassword}
                      visible={showLoginPassword}
                      setVisible={setShowLoginPassword}
                    />
                  </div>

                  <SubmitButton loading={loading} label="Sign in" />
                </form>

                <p className="mt-8 text-center text-sm text-slate-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => changeMode("register")}
                    className="font-semibold text-[#0a1728]"
                  >
                    Create one
                  </button>
                </p>
              </div>

              <div
                className={`transition-all duration-500 ease-out ${
                  !isLogin
                    ? "translate-x-0 opacity-100"
                    : "translate-x-8 opacity-0 pointer-events-none absolute inset-0"
                }`}
              >
                <h1 className="font-display text-4xl font-bold tracking-tight text-[#0a1728]">
                  Create your account
                </h1>

                <p className="mt-3 text-sm text-slate-500">
                  A few details and you're ready to go.
                </p>

                {!isLogin && error && (
                  <div className="mt-6">
                    <ErrorMessage error={error} />
                  </div>
                )}

                <form
                  onSubmit={handleRegisterSubmit}
                  className="mt-8 space-y-4"
                >
                  <FormField
                    label="Full name"
                    type="text"
                    placeholder="Your full name"
                    value={regName}
                    onChange={setRegName}
                  />

                  <FormField
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={setRegEmail}
                  />

                  <FormField
                    label="Phone number"
                    type="tel"
                    placeholder="+237 6XX XXX XXX"
                    value={regPhone}
                    onChange={setRegPhone}
                    required={false}
                  />

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">
                      Password
                    </label>

                    <PasswordField
                      value={regPassword}
                      onChange={setRegPassword}
                      visible={showRegPassword}
                      setVisible={setShowRegPassword}
                    />

                    {regPassword && (
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <span
                            key={level}
                            className={`h-1 flex-1 rounded-sm ${
                              level <= passwordStrength
                                ? "bg-emerald-500"
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <label className="flex items-start gap-3 pt-1">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#0a1728]"
                    />

                    <span className="text-xs leading-5 text-slate-400">
                      I agree to the{" "}
                      <Link href="/terms" className="text-slate-600">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-slate-600">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>

                  <SubmitButton
                    loading={loading}
                    label="Create account"
                    disabled={!acceptedTerms}
                  />
                </form>

                <p className="mt-8 text-center text-sm text-slate-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => changeMode("login")}
                    className="font-semibold text-[#0a1728]"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="pb-6 text-center text-[10px] uppercase tracking-[0.18em] text-slate-300">
          Sanfaani
        </footer>
      </div>
    </main>
  );
}

/* ================================================================
   FORM FIELD
================================================================ */

function FormField({
  label,
  type,
  placeholder,
  value,
  onChange,
  required = true,
}: {
  label: string;
  type: Extract<InputHTMLAttributes<HTMLInputElement>["type"], string>;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold text-slate-600"
      >
        {label}
      </label>

      <input
        id={id}
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={
          type === "email"
            ? "email"
            : type === "tel"
              ? "tel"
              : type === "text"
                ? "name"
                : undefined
        }
        className="h-13 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-[#0a1728] focus:ring-1 focus:ring-[#0a1728]"
      />
    </div>
  );
}

/* ================================================================
   PASSWORD FIELD
================================================================ */

function PasswordField({
  value,
  onChange,
  visible,
  setVisible,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  setVisible: (value: boolean) => void;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
}) {
  return (
    <div className="relative">
      <input
        required
        minLength={8}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your password"
        autoComplete={autoComplete}
        className="h-13 w-full rounded-lg border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-[#0a1728] focus:ring-1 focus:ring-[#0a1728]"
      />

      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0a1728]"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

/* ================================================================
   SUBMIT BUTTON
================================================================ */

function SubmitButton({
  loading,
  label,
  disabled = false,
}: {
  loading: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="group flex h-13 w-full items-center justify-center gap-3 rounded-lg bg-[#0a1728] text-sm font-semibold text-white transition-all hover:bg-[#10233b] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Please wait...
        </>
      ) : (
        <>
          {label}

          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </>
      )}
    </button>
  );
}

/* ================================================================
   ERROR
================================================================ */

function ErrorMessage({ error }: { error: unknown }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {typeof error === "string"
        ? error
        : "Something went wrong. Please try again."}
    </div>
  );
}
