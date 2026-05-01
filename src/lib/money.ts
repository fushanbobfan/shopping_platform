export function formatMoney(cents: number, currency = "usd"): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}
