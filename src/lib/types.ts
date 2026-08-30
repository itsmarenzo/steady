export type Expense = {
  id: string;
  label: string;
  amount: string;
};

export type MonthlyPlanState = {
  income: string;
  expenses: Expense[];
  savingsGoal: string;
  savingsGoalTouched: boolean;
};

export const DEFAULT_EXPENSES: Expense[] = [
  { id: "rent", label: "Ενοίκιο", amount: "" },
  { id: "food", label: "Φαγητό", amount: "" },
  { id: "transport", label: "Μεταφορές", amount: "" },
  { id: "subscriptions", label: "Συνδρομές", amount: "" },
];

export const DEFAULT_MONTHLY_PLAN_STATE: MonthlyPlanState = {
  income: "",
  expenses: DEFAULT_EXPENSES,
  savingsGoal: "",
  savingsGoalTouched: false,
};
