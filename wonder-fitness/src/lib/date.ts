/**
 * Cộng tháng nhưng không tràn sang tháng sau.
 * Ví dụ: 31/01 + 1 tháng = 28/02 (hoặc 29/02 năm nhuận), không phải 03/03.
 */
export function addMonths(date: Date, months: number) {
  const d = new Date(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}
