'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import type { CartItem } from '@/types/models';
import type { CustomerOrder } from '@/types/storefront';
import * as productsApi from '@/services/productsApi';
import { Alert } from '@/lib/alert';
import { loadOrderIntoCart } from '@/lib/store/slices/cartSlice';
import { useAppDispatch } from '@/hooks/store';

/** "Bayar di Kasir": isi keranjang Kasir dengan item pesanan, lalu buka Kasir. */
export function usePayOrder() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pay = async (order: CustomerOrder) => {
    setLoadingId(order.id);
    try {
      const page = await productsApi.fetchProducts({ size: 500 });
      const byId = new Map(page.content.map((p) => [p.id, p]));
      const missing = order.items.filter((i) => !byId.has(i.productId));
      if (missing.length) {
        Alert.alert('Produk tidak ditemukan', `${missing.map((m) => m.productName).join(', ')} sudah tidak aktif. Ubah pesanan secara manual di Kasir.`);
        return;
      }
      const items: CartItem[] = order.items.map((i) => {
        const product = byId.get(i.productId)!;
        return {
          product,
          unitId: product.baseUnitId,
          unitName: product.baseUnitName,
          unitConversionToBase: 1,
          quantity: Number(i.quantity),
        };
      });
      dispatch(loadOrderIntoCart({ items, order: { id: order.id, orderNumber: order.orderNumber, customerName: order.customerName } }));
      router.push('/pos');
    } catch {
      Alert.alert('Gagal', 'Produk pesanan tidak bisa dimuat ke Kasir.');
    } finally {
      setLoadingId(null);
    }
  };

  return { pay, loadingId };
}
