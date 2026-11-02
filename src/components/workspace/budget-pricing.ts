export type BudgetLine = { amount: number | null; hours: number | null };

export function calculateQuote(lines: BudgetLine[], contextFactor: number, objectivePercent: number, reserveFactor = 1) {
  const missingAmounts = lines.some(line => line.amount === null || !Number.isFinite(line.amount) || line.amount < 0);
  const knownHours = lines.every(line => line.hours !== null && Number.isFinite(line.hours) && line.hours >= 0);
  const hours = knownHours ? lines.reduce((total, line) => total + (line.hours || 0), 0) : null;
  const base = missingAmounts ? null : lines.reduce((total, line) => total + (line.amount || 0), 0);
  if (base === null) return { base, hours, essential: null, recommended: null, corporate: null };
  const goalFactor = Math.max(0, 1 + objectivePercent / 100);
  const essential = Math.round(base * contextFactor * Math.max(1, reserveFactor) * goalFactor);
  const recommended = Math.round(essential * 1.2);
  return { base, hours, essential, recommended, corporate: Math.round(recommended * 1.25) };
}

export function sharedSubscriptionShare(monthlyAmount: number, projectCount: number) {
  return monthlyAmount >= 0 && projectCount > 0 ? monthlyAmount / projectCount : null;
}
