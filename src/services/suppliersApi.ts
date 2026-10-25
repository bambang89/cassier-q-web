import type { Supplier } from '@/types/models';
import type { SupplierPayload } from '@/types/api';
import { apiClient } from '@/lib/apiClient';

export async function fetchSuppliers(): Promise<Supplier[]> {
  const { data } = await apiClient.get<Supplier[]>('/suppliers');
  return data;
}

export async function createSupplier(payload: SupplierPayload): Promise<Supplier> {
  const { data } = await apiClient.post<Supplier>('/suppliers', payload);
  return data;
}

export async function updateSupplier(id: string, payload: SupplierPayload): Promise<Supplier> {
  const { data } = await apiClient.put<Supplier>(`/suppliers/${id}`, payload);
  return data;
}

/** Backend tidak benar-benar hapus datanya — cuma menonaktifkan (active=false), tanpa body balikan. */
export async function deactivateSupplier(id: string): Promise<void> {
  await apiClient.delete(`/suppliers/${id}`);
}
