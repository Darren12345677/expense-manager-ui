"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  LoaderCircle,
  LogOut,
  Plus,
  ReceiptText,
  UserRound,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ExpenseItem = {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
};

type TabId = "expenses" | "budget" | "profile";

const categories = [
  "Food and Dining",
  "Bills and Utilities",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health and Fitness",
  "Travel",
  "Subscriptions",
  "Investments",
];

const tabs = [
  { id: "expenses", label: "Expenses", icon: ReceiptText },
  { id: "budget", label: "Budget", icon: ChartNoAxesColumnIncreasing },
  { id: "profile", label: "Profile", icon: UserRound },
] as const;

const currency = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
});

class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function fetchExpenses(signal?: AbortSignal): Promise<ExpenseItem[]> {
  const response = await fetch("/api/expenses", { signal, cache: "no-store" });
  const result = (await response.json().catch(() => null)) as
    | ExpenseItem[]
    | { detail?: unknown }
    | null;

  if (!response.ok) {
    const detail =
      result && !Array.isArray(result) && typeof result.detail === "string"
        ? result.detail
        : "Unable to load expenses.";
    throw new ApiError(detail, response.status);
  }

  return Array.isArray(result) ? result : [];
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function ExpenseDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>("expenses");
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(categories[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const controller = new AbortController();

    fetchExpenses(controller.signal)
      .then(setExpenses)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : "Unable to load expenses.");
        setIsUnauthorized(error instanceof ApiError && error.status === 401);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  async function handleAddExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          amount: Number(amount),
          category,
          date,
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | ExpenseItem
        | { detail?: unknown }
        | null;

      if (!response.ok) {
        const detail =
          result && "detail" in result && typeof result.detail === "string"
            ? result.detail
            : "Unable to add this expense.";
        throw new Error(detail);
      }

      if (!result || !("id" in result)) {
        throw new Error("The API returned an invalid expense.");
      }

      setExpenses((current) =>
        [result as ExpenseItem, ...current].sort((first, second) => second.date.localeCompare(first.date)),
      );
      setDescription("");
      setAmount("");
      setCategory(categories[0]);
      setDate(new Date().toISOString().slice(0, 10));
      setIsFormOpen(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to add this expense.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const monthKey = new Date().toISOString().slice(0, 7);
  const thisMonth = expenses.filter((expense) => expense.date.startsWith(monthKey));
  const monthTotal = thisMonth.reduce((total, expense) => total + expense.amount, 0);
  const averageExpense = thisMonth.length ? monthTotal / thisMonth.length : 0;
  const sortedExpenses = [...expenses].sort((first, second) => second.date.localeCompare(first.date));

  return (
    <main className="min-h-svh bg-[#f4f3ed] text-[#1c3028]">
      <header className="bg-[#173c31] text-[#f7f5ee]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#e58c68] text-[#173c31]">
              <WalletCards aria-hidden="true" size={21} strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-sm font-semibold">Expense Manager</p>
              <p className="mt-0.5 text-[11px] text-[#c0cec5]">Personal workspace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            title="Sign out"
            className="flex size-10 items-center justify-center rounded-lg text-[#d0dbd4] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9a286]"
          >
            <LogOut aria-hidden="true" size={18} />
          </button>
        </div>
      </header>

      <div className="border-b border-[#d9ded8] bg-[#f8f7f2]">
        <nav
          aria-label="Main navigation"
          role="tablist"
          className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 sm:px-8"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-[#39735c] text-[#245340]"
                    : "border-transparent text-[#758078] hover:text-[#294238]"
                }`}
              >
                <Icon aria-hidden="true" size={17} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {activeTab === "expenses" && (
          <section role="tabpanel" aria-label="Expenses">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a9654c]">
                  {new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date())}
                </p>
                <h1 className="font-serif text-4xl leading-tight text-[#1c3028]">Expenses</h1>
                <p className="mt-2 text-sm text-[#6b756f]">Your recorded spending, in one place.</p>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setIsFormOpen((open) => !open);
                  setSubmitError("");
                }}
                className="h-11 gap-2 rounded-lg bg-[#c76d4f] px-4 text-sm font-semibold text-white shadow-none hover:bg-[#ad583d]"
              >
                <Plus aria-hidden="true" size={17} />
                Add expense
              </Button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[#d9ded8] bg-[#fbfaf6] p-5">
                <p className="text-xs font-medium text-[#6b756f]">Spent this month</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-[#1c3028]">
                  {currency.format(monthTotal)}
                </p>
              </div>
              <div className="rounded-lg border border-[#d9ded8] bg-[#fbfaf6] p-5">
                <p className="text-xs font-medium text-[#6b756f]">Transactions</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-[#1c3028]">
                  {thisMonth.length}
                </p>
              </div>
              <div className="rounded-lg border border-[#d9ded8] bg-[#fbfaf6] p-5">
                <p className="text-xs font-medium text-[#6b756f]">Average expense</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-[#1c3028]">
                  {currency.format(averageExpense)}
                </p>
              </div>
            </div>

            {isFormOpen && (
              <form
                onSubmit={handleAddExpense}
                className="mt-8 rounded-lg border border-[#d9ded8] bg-[#fbfaf6] p-5 sm:p-6"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-[#1c3028]">New expense</h2>
                    <p className="mt-1 text-xs text-[#6b756f]">Add the amount, category, and date.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="text-sm font-medium text-[#6b756f] underline-offset-4 hover:text-[#294238] hover:underline"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="expense-description" className="text-sm font-medium text-[#283a31]">
                      Description
                    </label>
                    <Input
                      id="expense-description"
                      name="description"
                      required
                      maxLength={200}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="e.g. Groceries"
                      className="h-11 rounded-lg border-[#d4dbd4] bg-white px-3 text-sm focus-visible:border-[#39735c] focus-visible:ring-[#39735c]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="expense-amount" className="text-sm font-medium text-[#283a31]">
                      Amount (SGD)
                    </label>
                    <Input
                      id="expense-amount"
                      name="amount"
                      type="number"
                      inputMode="decimal"
                      min="0.01"
                      step="0.01"
                      required
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="0.00"
                      className="h-11 rounded-lg border-[#d4dbd4] bg-white px-3 text-sm tabular-nums focus-visible:border-[#39735c] focus-visible:ring-[#39735c]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="expense-date" className="text-sm font-medium text-[#283a31]">
                      Date
                    </label>
                    <Input
                      id="expense-date"
                      name="date"
                      type="date"
                      required
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="h-11 rounded-lg border-[#d4dbd4] bg-white px-3 text-sm focus-visible:border-[#39735c] focus-visible:ring-[#39735c]/20"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <label htmlFor="expense-category" className="text-sm font-medium text-[#283a31]">
                      Category
                    </label>
                    <select
                      id="expense-category"
                      name="category"
                      required
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="h-11 w-full rounded-lg border border-[#d4dbd4] bg-white px-3 text-sm text-[#1c3028] outline-none focus-visible:border-[#39735c] focus-visible:ring-3 focus-visible:ring-[#39735c]/20"
                    >
                      {categories.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-11 w-full gap-2 rounded-lg bg-[#39735c] text-sm font-semibold text-white hover:bg-[#2e604b]"
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderCircle className="animate-spin" />
                          Saving
                        </>
                      ) : (
                        <>
                          Save expense
                          <ArrowRight data-icon="inline-end" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {submitError && (
                  <p
                    role="alert"
                    className="mt-4 rounded-md border border-[#d99b86]/50 bg-[#fbefea] px-3 py-2.5 text-sm text-[#8b3d2a]"
                  >
                    {submitError}
                  </p>
                )}
              </form>
            )}

            <section className="mt-9" aria-labelledby="expense-list-heading">
              <div className="flex items-center justify-between border-b border-[#cbd3cc] pb-3">
                <h2 id="expense-list-heading" className="text-base font-semibold text-[#1c3028]">
                  Recent expenses
                </h2>
                <span className="text-xs text-[#6b756f]">{expenses.length} total</span>
              </div>

              {isLoading ? (
                <div className="flex h-32 items-center justify-center gap-2 text-sm text-[#6b756f]" role="status">
                  <LoaderCircle className="animate-spin text-[#39735c]" size={18} />
                  Loading expenses
                </div>
              ) : loadError ? (
                <div className="flex flex-col items-start gap-3 border-b border-[#d9ded8] py-8 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#8b3d2a]" role="alert">{loadError}</p>
                  {isUnauthorized && (
                    <Button type="button" variant="outline" onClick={onSignOut}>
                      Return to sign in
                    </Button>
                  )}
                </div>
              ) : sortedExpenses.length === 0 ? (
                <div className="flex min-h-40 flex-col items-center justify-center border-b border-[#d9ded8] py-8 text-center">
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#dce9df] text-[#39735c]">
                    <ArrowDownLeft aria-hidden="true" size={19} />
                  </span>
                  <p className="mt-3 text-sm font-medium text-[#1c3028]">No expenses recorded</p>
                  <p className="mt-1 text-xs text-[#6b756f]">Your first entry will appear here.</p>
                </div>
              ) : (
                <div>
                  {sortedExpenses.map((expense) => (
                    <article
                      key={expense.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-[#d9ded8] py-4 sm:grid-cols-[minmax(0,1fr)_minmax(150px,0.7fr)_110px_120px]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#1c3028]">{expense.description}</p>
                        <p className="mt-1 text-xs text-[#6b756f] sm:hidden">{expense.category}</p>
                      </div>
                      <p className="hidden truncate text-sm text-[#6b756f] sm:block">{expense.category}</p>
                      <p className="text-right text-sm text-[#6b756f] sm:text-left">{formatDate(expense.date)}</p>
                      <p className="row-start-1 text-right text-sm font-semibold tabular-nums text-[#1c3028] sm:col-start-4">
                        {currency.format(expense.amount)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>
        )}

        {activeTab === "budget" && (
          <section role="tabpanel" aria-label="Budget">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a9654c]">
              Planning
            </p>
            <h1 className="font-serif text-4xl leading-tight text-[#1c3028]">Budget</h1>
            <div className="mt-8 border-y border-[#d9ded8] py-8">
              <p className="text-sm font-medium text-[#1c3028]">No monthly budget set</p>
              <p className="mt-2 max-w-lg text-sm leading-6 text-[#6b756f]">
                Monthly budget controls are not available yet.
              </p>
            </div>
          </section>
        )}

        {activeTab === "profile" && (
          <section role="tabpanel" aria-label="Profile">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a9654c]">
              Account
            </p>
            <h1 className="font-serif text-4xl leading-tight text-[#1c3028]">Profile</h1>
            <div className="mt-8 flex flex-col gap-5 border-y border-[#d9ded8] py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#1c3028]">Session active</p>
                <p className="mt-1 text-sm text-[#6b756f]">Your account is signed in on this browser.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={onSignOut}
                className="h-10 border-[#cbd3cc] bg-transparent text-[#294238] hover:bg-[#e9ece7]"
              >
                <LogOut aria-hidden="true" />
                Sign out
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}