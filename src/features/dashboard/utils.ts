import type { SalesSummary } from '@/types/models';

export function lastSevenDates(): Date[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date;
  });
}

export function percentDelta(today: number, yesterday: number): number | null {
  if (yesterday <= 0) return null;
  return ((today - yesterday) / yesterday) * 100;
}

export function mergeTopSellers(days: SalesSummary[], limit = 4) {
  const byProduct = new Map<string, { productId: string; productName: string; totalQuantity: number; totalRevenue: number }>();
  for (const day of days) {
    for (const seller of day.topSellers) {
      const existing = byProduct.get(seller.productId);
      if (existing) {
        existing.totalQuantity += seller.totalQuantity;
        existing.totalRevenue += seller.totalRevenue;
      } else {
        byProduct.set(seller.productId, { ...seller });
      }
    }
  }
  return Array.from(byProduct.values())
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit);
}
