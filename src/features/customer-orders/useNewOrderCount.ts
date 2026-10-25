'use client';

import { useEffect, useState } from 'react';

import { fetchOrderCounts } from '@/api/customerOrdersApi';

/** Jumlah pesanan berstatus Baru, diperbarui tiap 30 detik (badge menu Pesanan). */
export function useNewOrderCount(enabled: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const load = () =>
      fetchOrderCounts()
        .then((c) => alive && setCount(c.newCount))
        .catch(() => undefined);
    load();
    const timer = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [enabled]);
  return enabled ? count : 0;
}
