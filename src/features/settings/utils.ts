import type { PromoCode } from '@/types/models';
import { formatRupiah } from '@/utils/format';
import type { PromoStatus } from '@/features/settings/types';

/** Short description of a promo, e.g. "Diskon 10% · maks. Rp20.000 · min. belanja Rp100.000". */
export function promoSummary(p: PromoCode): string {
  const parts = [p.discountType === 'PERCENT' ? `Diskon ${p.discountValue}%` : `Potongan ${formatRupiah(p.discountValue)}`];
  if (p.maxDiscountAmount) parts.push(`maks. ${formatRupiah(p.maxDiscountAmount)}`);
  if (p.minPurchaseAmount) parts.push(`min. belanja ${formatRupiah(p.minPurchaseAmount)}`);
  return parts.join(' · ');
}

/** Current state of a promo for its badge: active, scheduled, expired, used up or off. */
export function promoStatus(p: PromoCode, now = Date.now()): PromoStatus {
  if (!p.active) return { label: 'Nonaktif', tone: 'neutral' };
  if (p.endsAt && new Date(p.endsAt).getTime() < now) return { label: 'Kedaluwarsa', tone: 'error' };
  if (p.usageLimit !== null && p.usedCount >= p.usageLimit) return { label: 'Kuota habis', tone: 'error' };
  if (p.startsAt && new Date(p.startsAt).getTime() > now) return { label: 'Terjadwal', tone: 'warning' };
  return { label: 'Aktif', tone: 'success' };
}

/**
 * Suggests a short, readable promo code from the promo name and value,
 * e.g. "Promo Akhir Pekan" 10% → "AKHIR10-K7P". Avoids look-alike characters (0/O, 1/I).
 */
export function generatePromoCode(name: string, discountType: 'PERCENT' | 'AMOUNT', value: number): string {
  const STOP_WORDS = ['PROMO', 'DISKON', 'POTONGAN', 'SPESIAL', 'SPECIAL'];
  const words = name
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.includes(w));
  const prefix = (words[0] ?? 'HEMAT').slice(0, 6);
  const amount =
    value > 0 ? (discountType === 'PERCENT' ? String(Math.round(value)) : `${Math.round(value / 1000)}K`) : '';
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const random = Array.from({ length: 3 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `${prefix}${amount}-${random}`.slice(0, 30);
}
