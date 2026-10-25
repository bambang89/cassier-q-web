import type { Unit } from '@/types/models';
import type { UnitPayload } from '@/types/api';
import { apiClient } from '@/lib/apiClient';

export async function fetchUnits(): Promise<Unit[]> {
  const { data } = await apiClient.get<Unit[]>('/units');
  return data;
}

export async function createUnit(payload: UnitPayload): Promise<Unit> {
  const { data } = await apiClient.post<Unit>('/units', payload);
  return data;
}

export async function updateUnit(id: string, payload: UnitPayload): Promise<Unit> {
  const { data } = await apiClient.put<Unit>(`/units/${id}`, payload);
  return data;
}

/** Gagal 409 kalau satuan masih dipakai produk — biarkan caller nangkep errornya. */
export async function deleteUnit(id: string): Promise<void> {
  await apiClient.delete(`/units/${id}`);
}
