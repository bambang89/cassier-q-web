import type { Page, PriceTier, Product, ProductPhoto, ProductUnit } from '@/types/models';
import type { FetchProductsParams, ProductPayload, ProductPhotoFile, RestockPayload, RegisterProductUnitPayload } from '@/types/api';
import type { Stock } from '@/types/inventory';
import { apiClient } from '@/lib/apiClient';
import { isNotFound } from '@/utils/apiErrors';

export async function fetchProducts({ search, page = 0, size = 50 }: FetchProductsParams = {}): Promise<
  Page<Product>
> {
  const { data } = await apiClient.get<Page<Product>>('/products', {
    params: { search: search || undefined, page, size },
  });
  return data;
}

export async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const { data } = await apiClient.get<Product>(`/products/barcode/${encodeURIComponent(barcode)}`);
    return data;
  } catch (error: unknown) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.post<Product>('/products', payload);
  return data;
}

export async function updateProduct(id: string, payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.put<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

/** Upload/ganti foto produk (JPG/PNG/WEBP, maks 5MB) — balikan produk lengkap dgn imageUrl baru. */
export async function uploadProductPhoto(id: string, file: ProductPhotoFile): Promise<Product> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<Product>(`/products/${id}/photo`, formData);
  return data;
}

/** Daftar foto galeri produk (di luar foto utama/imageUrl). */
export async function fetchProductPhotos(productId: string): Promise<ProductPhoto[]> {
  const { data } = await apiClient.get<ProductPhoto[]>(`/products/${productId}/photos`);
  return data;
}

/** Tambah 1 foto ke galeri produk (JPG/PNG/WEBP, maks 5MB). */
export async function addProductPhoto(productId: string, file: ProductPhotoFile): Promise<ProductPhoto> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<ProductPhoto>(`/products/${productId}/photos`, formData);
  return data;
}

export async function deleteProductPhoto(productId: string, photoId: string): Promise<void> {
  await apiClient.delete(`/products/${productId}/photos/${photoId}`);
}

export async function restockProduct(id: string, payload: RestockPayload): Promise<Stock> {
  const { data } = await apiClient.post<Stock>(`/products/${id}/restock`, payload);
  return data;
}

/** Daftar satuan berlaku (dasar + alternatif) utk 1 produk. */
export async function fetchProductUnits(productId: string): Promise<ProductUnit[]> {
  const { data } = await apiClient.get<ProductUnit[]>(`/products/${productId}/units`);
  return data;
}

/** Daftarkan satuan alternatif + rasio konversinya (pasangan tulis dari /convert). */
export async function registerProductUnit(
  productId: string,
  payload: RegisterProductUnitPayload,
): Promise<ProductUnit> {
  const { data } = await apiClient.post<ProductUnit>(`/products/${productId}/units`, payload);
  return data;
}

/** Harga grosir bertingkat produk di toko ini. */
export async function fetchPriceTiers(productId: string): Promise<PriceTier[]> {
  const { data } = await apiClient.get<PriceTier[]>(`/products/${productId}/price-tiers`);
  return data;
}

/** Ganti semua tingkat harga grosir produk (daftar kosong = tanpa harga grosir). */
export async function updatePriceTiers(productId: string, tiers: PriceTier[]): Promise<PriceTier[]> {
  const { data } = await apiClient.put<PriceTier[]>(`/products/${productId}/price-tiers`, { tiers });
  return data;
}
