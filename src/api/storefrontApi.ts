import axios from 'axios';

import { apiClient } from './client';
import { env } from '@/config/env';
import type {
  PublicOrderRequest,
  PublicOrderStatus,
  PublicStorefront,
  StorefrontLayout,
  StorefrontSettings,
} from '@/types/storefront';

// ── Pemilik toko (perlu login) ────────────────────────────────────────

export async function fetchStorefrontSettings(): Promise<StorefrontSettings> {
  const { data } = await apiClient.get<StorefrontSettings>('/storefront');
  return data;
}

export async function saveStorefront(payload: {
  slug: string;
  published: boolean;
  themeColor: string;
  layout: StorefrontLayout;
}): Promise<StorefrontSettings> {
  const { data } = await apiClient.put<StorefrontSettings>('/storefront', payload);
  return data;
}

export async function uploadStorefrontImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<{ url: string }>('/storefront/images', formData);
  return data.url;
}

// ── Pembeli (tanpa login) — klien terpisah tanpa token/device header ───

const publicClient = axios.create({ baseURL: env.apiBaseUrl, timeout: 15000 });

/** Sama seperti interceptor apiClient: URL foto jadi /uploads/... (lewat proxy). */
publicClient.interceptors.response.use((response) => {
  response.data = JSON.parse(JSON.stringify(response.data).replace(/https?:\/\/[^/"]+(\/uploads\/)/g, '$1'));
  return response;
});

export async function fetchPublicStorefront(slug: string): Promise<PublicStorefront> {
  const { data } = await publicClient.get<PublicStorefront>(`/public/storefronts/${encodeURIComponent(slug)}`);
  return data;
}

export async function placePublicOrder(slug: string, payload: PublicOrderRequest): Promise<PublicOrderStatus> {
  const { data } = await publicClient.post<PublicOrderStatus>(`/public/storefronts/${encodeURIComponent(slug)}/orders`, payload);
  return data;
}

export async function fetchPublicOrder(slug: string, orderId: string): Promise<PublicOrderStatus> {
  const { data } = await publicClient.get<PublicOrderStatus>(`/public/storefronts/${encodeURIComponent(slug)}/orders/${orderId}`);
  return data;
}
