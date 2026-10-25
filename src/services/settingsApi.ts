import type { CheckoutSettings } from '@/types/models';
import type { UpdateCheckoutSettingsPayload } from '@/types/api';
import { apiClient } from '@/lib/apiClient';

/** Accepted payment methods, default method and PPN of the active store. */
export async function fetchCheckoutSettings(): Promise<CheckoutSettings> {
  const { data } = await apiClient.get<CheckoutSettings>('/store/checkout-settings');
  return data;
}

/** Saves checkout settings (store owner only). */
export async function updateCheckoutSettings(payload: UpdateCheckoutSettingsPayload): Promise<CheckoutSettings> {
  const { data } = await apiClient.put<CheckoutSettings>('/store/checkout-settings', payload);
  return data;
}
