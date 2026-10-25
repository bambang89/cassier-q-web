import type { Customer, LedgerEntry } from '@/types/models';
import type { CustomerPayload } from '@/types/api';
import { apiClient } from '@/lib/apiClient';

export async function fetchCustomers(): Promise<Customer[]> {
  const { data } = await apiClient.get<Customer[]>('/customers');
  return data;
}

export async function fetchCustomer(id: string): Promise<Customer> {
  const { data } = await apiClient.get<Customer>(`/customers/${id}`);
  return data;
}

export async function createCustomer(payload: CustomerPayload): Promise<Customer> {
  const { data } = await apiClient.post<Customer>('/customers', payload);
  return data;
}

export async function updateCustomer(id: string, payload: CustomerPayload): Promise<Customer> {
  const { data } = await apiClient.put<Customer>(`/customers/${id}`, payload);
  return data;
}

/** Riwayat hutang & pembayaran pelanggan, terbaru dulu. */
export async function fetchCustomerLedger(id: string): Promise<LedgerEntry[]> {
  const { data } = await apiClient.get<LedgerEntry[]>(`/customers/${id}/ledger`);
  return data;
}

/** Catat pelanggan membayar sebagian/seluruh hutangnya — balikannya data customer terbaru (saldo sudah update). */
export async function recordCustomerPayment(id: string, amount: number, notes?: string): Promise<Customer> {
  const { data } = await apiClient.post<Customer>(`/customers/${id}/payments`, { amount, notes });
  return data;
}
