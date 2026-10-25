import type { SalesSummary } from '@/types/models';
import type { FetchSalesSummaryParams } from '@/types/api';
import { apiClient } from '@/lib/apiClient';
import { toIsoDate } from '@/utils/date';
import { lastSevenDates } from '@/features/dashboard/utils';

export async function fetchSalesSummary(params: FetchSalesSummaryParams = {}): Promise<SalesSummary> {
  const { data } = await apiClient.get<SalesSummary>('/reports/summary', { params });
  return data;
}

export async function fetchLastSevenDays(): Promise<SalesSummary[]> {
  return Promise.all(
    lastSevenDates().map((date) => {
      const iso = toIsoDate(date);
      return fetchSalesSummary({ from: iso, to: iso });
    }),
  );
}
