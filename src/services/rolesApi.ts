import type { Role } from '@/types/models';
import { apiClient } from '@/lib/apiClient';

/** Daftar role yang bisa dipilih saat menambah karyawan. */
export async function fetchRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<Role[]>('/roles');
  return data;
}
