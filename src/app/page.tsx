import MonthlyPlanCalculator from "@/components/MonthlyPlanCalculatorLoader";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:py-12">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-emerald-700">Steady</h1>
        <p className="mt-1 text-sm text-stone-500">
          Βάλε το εισόδημα και τα έξοδά σου και δες καθαρά τι σου μένει —
          χωρίς οικονομίστικα και χωρίς άγχος.
        </p>
      </header>

      <MonthlyPlanCalculator />

      <footer className="mt-10 text-center text-xs text-stone-400">
        Έρχονται σύντομα: κανόνας 50/30/20 &amp; «πόσο κοστίζει να φύγω από το σπίτι».
      </footer>
    </main>
  );
}
