import { toIsoDate } from '@/utils/date';
import type { ReportRange } from '@/features/reports/types';

export function rangeParams(days: ReportRange) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: toIsoDate(from), to: toIsoDate(to) };
}
