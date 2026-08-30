"use client";

import { useEffect, useState } from "react";
import { loadState, saveState, clearState } from "@/lib/storage";
import { formatEUR, toNumber } from "@/lib/currency";
import { DEFAULT_MONTHLY_PLAN_STATE, type MonthlyPlanState } from "@/lib/types";

const STORAGE_KEY = "steady:monthly-plan:v1";

function newExpenseId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `expense-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Αυτό το component φορτώνεται μόνο στον browser (δες dynamic import στη
// σελίδα, με ssr: false) — οπότε μπορούμε να διαβάσουμε το localStorage
// κατευθείαν στο αρχικό state, χωρίς κίνδυνο hydration mismatch.
function loadInitialState(): MonthlyPlanState {
  const saved = loadState<MonthlyPlanState>(STORAGE_KEY, DEFAULT_MONTHLY_PLAN_STATE);
  return {
    ...saved,
    expenses: saved.expenses.length > 0 ? saved.expenses : DEFAULT_MONTHLY_PLAN_STATE.expenses,
  };
}

export default function MonthlyPlanCalculator() {
  const [plan, setPlan] = useState<MonthlyPlanState>(loadInitialState);
  const { income, expenses, savingsGoal, savingsGoalTouched } = plan;

  // Κάθε αλλαγή του πλάνου αποθηκεύεται αυτόματα.
  useEffect(() => {
    saveState(STORAGE_KEY, plan);
  }, [plan]);

  const incomeNum = toNumber(income);
  const totalExpenses = expenses.reduce((sum, e) => sum + toNumber(e.amount), 0);
  const monthlyRemaining = incomeNum - totalExpenses;
  const weeklyRemaining = (monthlyRemaining * 12) / 52;
  const isOverBudget = monthlyRemaining < 0;

  // Όσο ο χρήστης δεν έχει πειράξει το πεδίο αποταμίευσης, προτείνουμε
  // αυτόματα ό,τι του μένει — υπολογισμένο κατά το render, όχι σε effect.
  const suggestedSavings = monthlyRemaining > 0 ? monthlyRemaining : 0;
  const savingsFieldValue = savingsGoalTouched
    ? savingsGoal
    : suggestedSavings === 0
      ? ""
      : String(Math.round(suggestedSavings * 100) / 100);
  const savingsNum = toNumber(savingsFieldValue);
  const projection12 = savingsNum * 12;

  function setIncome(value: string) {
    setPlan((prev) => ({ ...prev, income: value }));
  }

  function updateExpense(id: string, field: "label" | "amount", value: string) {
    setPlan((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  }

  function removeExpense(id: string) {
    setPlan((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== id) }));
  }

  function addExpense() {
    setPlan((prev) => ({
      ...prev,
      expenses: [...prev.expenses, { id: newExpenseId(), label: "", amount: "" }],
    }));
  }

  function setSavingsGoal(value: string) {
    setPlan((prev) => ({ ...prev, savingsGoal: value, savingsGoalTouched: true }));
  }

  function resetSavingsGoal() {
    setPlan((prev) => ({ ...prev, savingsGoalTouched: false }));
  }

  function clearAllData() {
    const ok = window.confirm(
      "Σίγουρα θες να διαγράψεις όλα τα δεδομένα από αυτή τη συσκευή; Δεν μπορείς να το αναιρέσεις.",
    );
    if (!ok) return;
    clearState(STORAGE_KEY);
    setPlan(DEFAULT_MONTHLY_PLAN_STATE);
  }

  return (
    <div className="space-y-5">
      {/* Εισόδημα */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <label htmlFor="income" className="block text-sm font-medium text-stone-700">
          Καθαρό μηνιαίο εισόδημα
        </label>
        <p className="mt-0.5 text-xs text-stone-400">Αυτό που μπαίνει στο χέρι, μετά από φόρους.</p>
        <div className="mt-2 flex items-center gap-2">
          <input
            id="income"
            type="text"
            inputMode="decimal"
            placeholder="π.χ. 950"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-lg font-medium text-stone-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <span className="text-stone-400">€</span>
        </div>
      </section>

      {/* Σταθερά έξοδα */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-medium text-stone-700">Σταθερά έξοδα</h2>
        <p className="mt-0.5 text-xs text-stone-400">
          Ό,τι ξοδεύεις κάθε μήνα σχεδόν σίγουρα — άλλαξε τα ονόματα όπως σε βολεύει.
        </p>

        <ul className="mt-3 space-y-2">
          {expenses.map((expense) => (
            <li key={expense.id} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Έξοδο"
                value={expense.label}
                onChange={(e) => updateExpense(expense.id, "label", e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
              <div className="flex w-28 shrink-0 items-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={expense.amount}
                  onChange={(e) => updateExpense(expense.id, "amount", e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-right text-sm text-stone-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
                <span className="text-xs text-stone-400">€</span>
              </div>
              <button
                type="button"
                onClick={() => removeExpense(expense.id)}
                aria-label={`Διαγραφή ${expense.label || "εξόδου"}`}
                className="shrink-0 rounded-lg p-2 text-stone-300 hover:bg-rose-50 hover:text-rose-500"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={addExpense}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300 py-2.5 text-sm font-medium text-stone-500 hover:border-emerald-300 hover:text-emerald-600"
        >
          <span aria-hidden>＋</span> Πρόσθεσε έξοδο
        </button>
      </section>

      {/* Αποτέλεσμα */}
      <section
        className={`rounded-2xl border p-5 shadow-sm ${
          isOverBudget ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <p className={`text-sm font-medium ${isOverBudget ? "text-rose-700" : "text-emerald-700"}`}>
          {isOverBudget ? "Ξοδεύεις περισσότερα απ' όσα βγάζεις" : "Σου μένουν"}
        </p>
        <p className={`mt-1 text-3xl font-bold ${isOverBudget ? "text-rose-700" : "text-emerald-800"}`}>
          {formatEUR(monthlyRemaining)}
          <span className="text-base font-medium text-stone-400"> / μήνα</span>
        </p>
        <p className={`mt-1 text-sm ${isOverBudget ? "text-rose-600" : "text-emerald-700"}`}>
          {formatEUR(weeklyRemaining)} τη βδομάδα
        </p>
        {isOverBudget && (
          <p className="mt-3 text-xs text-rose-600">
            Δες αν κάποιο από τα έξοδα παραπάνω μπορεί να μικρύνει — δεν χρειάζεται να τα λύσεις όλα σήμερα.
          </p>
        )}
      </section>

      {/* Προβολή αποταμίευσης */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <label htmlFor="savings" className="block text-sm font-medium text-stone-700">
          Πόσο θες να βάζεις στην άκρη το μήνα;
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            id="savings"
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={savingsFieldValue}
            onChange={(e) => setSavingsGoal(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-lg font-medium text-stone-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <span className="text-stone-400">€</span>
        </div>
        {savingsGoalTouched && (
          <button
            type="button"
            onClick={resetSavingsGoal}
            className="mt-2 text-xs font-medium text-emerald-600 hover:underline"
          >
            Επαναφορά στο ό,τι σου μένει
          </button>
        )}

        <p className="mt-4 rounded-xl bg-stone-50 p-4 text-sm text-stone-600">
          Αν αποταμιεύεις <span className="font-semibold text-stone-900">{formatEUR(savingsNum)}</span>{" "}
          το μήνα, σε <span className="font-semibold text-stone-900">12 μήνες</span> θα έχεις{" "}
          <span className="font-semibold text-emerald-700">{formatEUR(projection12)}</span>.
        </p>
      </section>

      {/* Ιδιωτικότητα */}
      <section className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs text-emerald-800">
        <span aria-hidden className="text-base leading-none">🔒</span>
        <p>
          Όλα όσα γράφεις μένουν μόνο σε αυτή τη συσκευή, μέσα στον browser σου. Δεν υπάρχει
          server, δεν στέλνουμε τίποτα πουθενά, δεν συνδέεσαι με καμία τράπεζα.
        </p>
      </section>

      <div className="text-center">
        <button
          type="button"
          onClick={clearAllData}
          className="text-xs text-stone-400 hover:text-rose-500 hover:underline"
        >
          Διάγραψε όλα τα δεδομένα από αυτή τη συσκευή
        </button>
      </div>
    </div>
  );
}
