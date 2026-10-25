import type { LineDraft } from '@/features/purchase-orders/types';

let lineKeySeq = 0;

export function newLine(): LineDraft {
  lineKeySeq += 1;
  return { key: `line-${lineKeySeq}`, productId: null, unitId: null, quantity: '', unitCost: '' };
}
