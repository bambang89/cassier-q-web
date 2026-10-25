import type { FieldOption } from '@/features/storefront/types';

export const LINK_HELP = 'Tautan web (https://…), nomor WA (wa:0812…), atau lompat ke blok (#produk).';

export const HEIGHTS: FieldOption[] = [
  { value: 'sm', label: 'Pendek' },
  { value: 'md', label: 'Sedang' },
  { value: 'lg', label: 'Tinggi' },
  { value: 'xl', label: 'Layar penuh' },
];

export const ASPECTS: FieldOption[] = [
  { value: 'auto', label: 'Asli' },
  { value: '21/9', label: '21:9' },
  { value: '16/9', label: '16:9' },
  { value: '4/3', label: '4:3' },
  { value: '1/1', label: '1:1' },
];

export const COLS = (values: string[]): FieldOption[] => values.map((v) => ({ value: v, label: v }));

export const SOCIAL_PLATFORMS: { value: string; label: string; emoji: string; color: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp', emoji: '💬', color: '#25D366' },
  { value: 'instagram', label: 'Instagram', emoji: '📸', color: '#E1306C' },
  { value: 'tiktok', label: 'TikTok', emoji: '🎵', color: '#111111' },
  { value: 'facebook', label: 'Facebook', emoji: '👍', color: '#1877F2' },
  { value: 'youtube', label: 'YouTube', emoji: '▶️', color: '#FF0000' },
  { value: 'x', label: 'X / Twitter', emoji: '✖️', color: '#111111' },
  { value: 'shopee', label: 'Shopee', emoji: '🛒', color: '#EE4D2D' },
  { value: 'tokopedia', label: 'Tokopedia', emoji: '🟢', color: '#03AC0E' },
  { value: 'gofood', label: 'GoFood', emoji: '🛵', color: '#00AA13' },
  { value: 'grabfood', label: 'GrabFood', emoji: '🍱', color: '#00B14F' },
  { value: 'website', label: 'Website', emoji: '🌐', color: '#334155' },
];

export const uid = () => Math.random().toString(36).slice(2, 9);
