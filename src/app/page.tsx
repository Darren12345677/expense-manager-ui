"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthResponse = {
  authenticated?: boolean;
  detail?: string;
};

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/auth/token", { signal: controller.signal })
      .then((response) => response.json())
      .then((result: AuthResponse) => {
        setIsAuthenticated(Boolean(result.authenticated));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsCheckingSession(false);
        }
      });

    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }),
      });
      const result = (await response.json()) as AuthResponse;

      if (!response.ok) {
        throw new Error(result.detail ?? "Sign in failed. Check your details and try again.");
      }

      setIsAuthenticated(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    await fetch("/api/auth/token", { method: "DELETE" });
    setIsAuthenticated(false);
    setPassword("");
  }

  return (
    <main className="login-page min-h-svh lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="login-showcase relative flex min-h-[210px] flex-col overflow-hidden px-7 py-6 text-[#f7f5ee] sm:px-10 lg:min-h-svh lg:px-14 lg:py-10">
        <div aria-hidden="true" className="showcase-pattern absolute inset-0" />
        <header className="relative z-10 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#e58c68] text-[#173c31]">
            <WalletCards aria-hidden="true" size={21} strokeWidth={1.8} />
          </span>
          <span className="text-[15px] font-semibold tracking-[0.01em]">
            Expense Manager
          </span>
        </header>

        <div className="relative z-10 flex flex-1 flex-col justify-center pt-7 lg:pt-0">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e9a286]">
            Personal finance
          </p>
          <h1 className="max-w-lg font-serif text-5xl leading-[1.04] sm:text-6xl">
            Know where
            <br />
            it goes.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#d0dbd4]">
            A little clarity can change the whole picture.
          </p>

          <div
            aria-hidden="true"
            className="mt-10 hidden h-[220px] items-end gap-3 border-b border-white/20 px-2 lg:flex"
          >
            <div className="login-bar h-[28%] flex-1 rounded-t-sm bg-[#e58c68]/55" />
            <div className="login-bar h-[48%] flex-1 rounded-t-sm bg-[#c6d3c9]/50" />
            <div className="login-bar h-[37%] flex-1 rounded-t-sm bg-[#e58c68]/75" />
            <div className="login-bar h-[67%] flex-1 rounded-t-sm bg-[#c6d3c9]/65" />
            <div className="login-bar h-[53%] flex-1 rounded-t-sm bg-[#e58c68]/65" />
            <div className="login-bar h-[84%] flex-1 rounded-t-sm bg-[#c6d3c9]/80" />
            <div className="login-bar h-[72%] flex-1 rounded-t-sm bg-[#e58c68]" />
            <div className="login-bar h-[96%] flex-1 rounded-t-sm bg-[#c6d3c9]" />
          </div>
        </div>
        <p className="relative z-10 mt-6 hidden text-xs text-[#c0cec5] lg:block">
          Your account, at your pace.
        </p>
      </aside>

      <section className="flex min-h-[calc(100svh-210px)] items-center justify-center px-6 py-12 sm:px-10 lg:min-h-svh lg:px-14">
        <div className="login-form-enter w-full max-w-[390px]">
          <div className="mb-9">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#a9654c]">
              Account access
            </p>
            <h2 className="font-serif text-[38px] leading-tight text-[#1c3028]">
              {isAuthenticated ? "You’re signed in." : "Welcome back."}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6b756f]">
              {isAuthenticated
                ? "Your session is active in this browser."
                : "Enter your username and password to continue."}
            </p>
          </div>

          {isCheckingSession ? (
            <div className="flex h-32 items-center justify-center" role="status">
              <LoaderCircle className="animate-spin text-[#39735c]" size={24} />
              <span className="sr-only">Checking your session</span>
            </div>
          ) : isAuthenticated ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-y border-[#d9ded8] py-5">
                <span className="flex size-10 items-center justify-center rounded-full bg-[#dce9df] text-[#39735c]">
                  <Check aria-hidden="true" size={20} />
                </span>
                <div>
                  <p className="text-sm font-medium text-[#1c3028]">Authentication complete</p>
                  <p className="mt-1 text-xs text-[#6b756f]">You can safely close this page.</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full border-[#cbd3cc] bg-transparent text-[#294238] hover:bg-[#e9ece7]"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-[#283a31]">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Your username"
                  className="h-12 rounded-lg border-[#d4dbd4] bg-white px-3 text-sm text-[#1c3028] placeholder:text-[#9ba49d] focus-visible:border-[#39735c] focus-visible:ring-[#39735c]/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-[#283a31]">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Your password"
                    className="h-12 rounded-lg border-[#d4dbd4] bg-white px-3 pr-12 text-sm text-[#1c3028] placeholder:text-[#9ba49d] focus-visible:border-[#39735c] focus-visible:ring-[#39735c]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#758078] transition-colors hover:text-[#294238] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#39735c]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-[#d99b86]/50 bg-[#fbefea] px-3 py-2.5 text-sm text-[#8b3d2a]"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-lg bg-[#c76d4f] text-sm font-semibold text-white shadow-none hover:bg-[#ad583d]"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Signing in
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight data-icon="inline-end" />
                  </>
                )}
              </Button>
              <p className="flex items-center justify-center gap-2 pt-2 text-xs text-[#7c867f]">
                <LockKeyhole aria-hidden="true" size={14} />
                Your credentials are sent securely to your account service.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
