import type { Employee } from '@/types/models';
import type { CreateEmployeePayload, UpdateEmployeePayload } from '@/types/api';
import { apiClient } from '@/lib/apiClient';

export async function fetchEmployees(): Promise<Employee[]> {
  const { data } = await apiClient.get<Employee[]>('/employees');
  return data;
}

export async function fetchEmployee(id: string): Promise<Employee> {
  const { data } = await apiClient.get<Employee>(`/employees/${id}`);
  return data;
}

/** Username & password TIDAK bisa diubah lewat update — hanya saat dibuat pertama kali. */
export async function createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
  const { data } = await apiClient.post<Employee>('/employees', payload);
  return data;
}

export async function updateEmployee(id: string, payload: UpdateEmployeePayload): Promise<Employee> {
  const { data } = await apiClient.put<Employee>(`/employees/${id}`, payload);
  return data;
}

/** Akun tidak bisa login lagi & sesi aktif langsung dicabut. */
export async function deactivateEmployee(id: string): Promise<Employee> {
  const { data } = await apiClient.post<Employee>(`/employees/${id}/deactivate`);
  return data;
}

export async function reactivateEmployee(id: string): Promise<Employee> {
  const { data } = await apiClient.post<Employee>(`/employees/${id}/reactivate`);
  return data;
}

/** Upload/ganti foto karyawan (Kepala Toko). */
export async function uploadEmployeePhoto(
  id: string,
  file: File,
): Promise<Employee> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<Employee>(`/employees/${id}/photo`, formData);
  return data;
}

/** Hapus foto karyawan. */
export async function removeEmployeePhoto(id: string): Promise<Employee> {
  const { data } = await apiClient.delete<Employee>(`/employees/${id}/photo`);
  return data;
}
