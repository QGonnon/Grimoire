/**
 * Formats large numbers with k/m/b suffixes (1 000 -> "1.00k", 1 000 000 ->
 * "1.00m", 1 000 000 000 -> "1.00b"). Values under 1000 are shown as-is
 * (integers with no decimals, fractional amounts with 2 decimals) since the
 * suffix only helps once numbers get hard to read at a glance.
 */
export function formatNumber(value: number): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(2)}b`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}m`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(2)}k`;
  if (Number.isInteger(abs)) return `${sign}${abs}`;
  return `${sign}${abs.toFixed(2)}`;
}
