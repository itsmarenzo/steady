"use client";

import dynamic from "next/dynamic";

// Wrapper client component: μόνο εδώ επιτρέπεται το ssr:false (next/dynamic
// με ssr:false δεν επιτρέπεται μέσα σε Server Component).
const MonthlyPlanCalculator = dynamic(
  () => import("@/components/MonthlyPlanCalculator"),
  { ssr: false },
);

export default function MonthlyPlanCalculatorLoader() {
  return <MonthlyPlanCalculator />;
}
