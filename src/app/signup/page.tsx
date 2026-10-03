"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SignupResponse = {
  created?: boolean;
  detail?: string;
};

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const result = (await response.json()) as SignupResponse;

      if (!response.ok) {
        throw new Error(result.detail ?? "Unable to create your account. Please try again.");
      }

      setIsCreated(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create your account right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
            A clearer picture
          </p>
          <h1 className="max-w-lg font-serif text-5xl leading-[1.04] sm:text-6xl">
            Start with
            <br />
            one small step.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#d0dbd4]">
            Create your account and bring your spending into focus.
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
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#a9654c]">
              Create account
            </p>
            <h2 className="font-serif text-[38px] leading-tight text-[#1c3028]">
              {isCreated ? "You’re all set." : "A fresh start."}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6b756f]">
              {isCreated
                ? "Your account has been created. Sign in to continue."
                : "Add your details to get started."}
            </p>
          </div>

          {isCreated ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-y border-[#d9ded8] py-5">
                <span className="flex size-10 items-center justify-center rounded-full bg-[#dce9df] text-[#39735c]">
                  <Check aria-hidden="true" size={20} />
                </span>
                <div>
                  <p className="text-sm font-medium text-[#1c3028]">Account created</p>
                  <p className="mt-1 text-xs text-[#6b756f]">You can now sign in with your new details.</p>
                </div>
              </div>
              <Link
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#c76d4f] text-sm font-semibold text-white transition-colors hover:bg-[#ad583d]"
                href="/"
              >
                Go to sign in
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
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
                  placeholder="Choose a username"
                  className="h-12 rounded-lg border-[#d4dbd4] bg-white px-3 text-sm text-[#1c3028] placeholder:text-[#9ba49d] focus-visible:border-[#39735c] focus-visible:ring-[#39735c]/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-[#283a31]">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
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

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium text-[#283a31]">
                  Confirm password
                </label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter your password again"
                  className="h-12 rounded-lg border-[#d4dbd4] bg-white px-3 text-sm text-[#1c3028] placeholder:text-[#9ba49d] focus-visible:border-[#39735c] focus-visible:ring-[#39735c]/20"
                />
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
                    Creating account
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight data-icon="inline-end" />
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-[#6b756f]">
                Already have an account?{" "}
                <Link className="font-semibold text-[#39735c] underline-offset-4 hover:underline" href="/">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}