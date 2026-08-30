const formatter = new Intl.NumberFormat("el-GR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export function formatEUR(amount: number): string {
  if (!Number.isFinite(amount)) return formatter.format(0);
  return formatter.format(amount);
}

/** Μετατρέπει input string (δέχεται και κόμμα ως δεκαδικό) σε αριθμό. */
export function toNumber(value: string): number {
  const normalized = value.trim().replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}
