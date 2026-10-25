import type { BadgeVariant } from '@/types/ui';
import type { OrderStatus } from '@/types/models';

export const STATUS_VARIANT: Record<string, BadgeVariant> = { PAID: 'success', VOID: 'error' };

export const STATUS_LABEL: Record<string, string> = { PAID: 'Lunas', VOID: 'Dibatalkan' };

export function statusLabel(status: OrderStatus) {
  return STATUS_LABEL[status] ?? status;
}
