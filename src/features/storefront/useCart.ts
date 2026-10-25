'use client';

import { useCallback, useEffect, useState } from 'react';

import type { PublicProduct } from '@/types/storefront';

export interface CartLine {
  product: PublicProduct;
  quantity: number;
  notes?: string;
}

const keyFor = (slug: string) => `cassierq.storefront.cart.${slug}`;

/** Keranjang pembeli per toko, disimpan di localStorage supaya tidak hilang saat halaman dimuat ulang. */
export function useCart(slug: string) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(keyFor(slug));
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      // keranjang rusak / storage diblokir — mulai kosong
    }
  }, [slug]);

  const persist = useCallback(
    (next: CartLine[]) => {
      setLines(next);
      try {
        localStorage.setItem(keyFor(slug), JSON.stringify(next));
      } catch {
        // abaikan
      }
    },
    [slug],
  );

  const add = (product: PublicProduct) => {
    const existing = lines.find((l) => l.product.id === product.id);
    persist(existing ? lines.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l)) : [...lines, { product, quantity: 1 }]);
  };
  const setQuantity = (productId: string, quantity: number) =>
    persist(quantity <= 0 ? lines.filter((l) => l.product.id !== productId) : lines.map((l) => (l.product.id === productId ? { ...l, quantity } : l)));
  const setNotes = (productId: string, notes: string) => persist(lines.map((l) => (l.product.id === productId ? { ...l, notes } : l)));
  const clear = () => persist([]);

  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const total = lines.reduce((sum, l) => sum + l.quantity * l.product.price, 0);
  const byId = Object.fromEntries(lines.map((l) => [l.product.id, l.quantity]));

  return { lines, add, setQuantity, setNotes, clear, count, total, byId };
}
