'use client';

import { useEffect, useState } from 'react';

import type { Product } from '@/types/models';
import * as productsApi from '@/services/productsApi';
import { useAppSelector } from '@/hooks/store';

/**
 * Produk berdasarkan id: dari daftar di store bila ada, selain itu dicari ke
 * server (API belum punya GET /products/{id}, jadi ambil daftar lalu cari).
 */
export function useProductById(id: string): { product: Product | null; loading: boolean } {
  const fromStore = useAppSelector((state) => state.products.items.find((p) => p.id === id) ?? null);
  const [fetched, setFetched] = useState<Product | null>(null);
  const [loading, setLoading] = useState(!fromStore);

  useEffect(() => {
    if (fromStore) return;
    let cancelled = false;
    (async () => {
      try {
        for (let page = 0; page < 20; page += 1) {
          const result = await productsApi.fetchProducts({ page, size: 100 });
          const found = result.content.find((p) => p.id === id);
          if (found || page + 1 >= result.totalPages) {
            if (!cancelled) setFetched(found ?? null);
            break;
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fromStore, id]);

  return { product: fromStore ?? fetched, loading: !fromStore && loading };
}
