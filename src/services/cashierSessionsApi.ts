import type { CashierSession } from '@/types/models';
import { apiClient } from '@/lib/apiClient';
import { isNotFound } from '@/utils/apiErrors';

export async function fetchCurrentSession(): Promise<CashierSession | null> {
  try {
    const { data } = await apiClient.get<CashierSession>('/cashier-sessions/current');
    return data;
  } catch (error: unknown) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export async function openSession(openingCash: number): Promise<CashierSession> {
  const { data } = await apiClient.post<CashierSession>('/cashier-sessions/open', { openingCash });
  return data;
}

export async function closeSession(
  id: string,
  payload: { actualCash: number; notes?: string },
): Promise<CashierSession> {
  const { data } = await apiClient.post<CashierSession>(`/cashier-sessions/${id}/close`, payload);
  return data;
}
