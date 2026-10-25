'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { StockMovementItem } from '@/types/inventory';
import * as inventoryApi from '@/services/inventoryApi';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/utils/cn';
import { formatQty } from '@/utils/format';
import { formatDateTimeShort } from '@/utils/date';
import { Button } from '@/components/ui/Button';
import { LoadingBlock } from '@/components/ui/Spinner';
import { ClipboardIcon } from '@/components/ui/icons/NavIcons';

/** Mulai hitung stok, dan lihat penyesuaian opname terakhir. */
export function OpnameTab() {
  const router = useRouter();
  const { can } = usePermissions();
  const [recent, setRecent] = useState<StockMovementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRecent((await inventoryApi.fetchMovements({ type: 'STOCK_OPNAME', size: 30 })).content);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="h-fit space-y-3 rounded-xl border border-line bg-white p-5 shadow-card">
        <span className="flex size-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <ClipboardIcon size={20} />
        </span>
        <div>
          <p className="font-bold text-ink">Stok Opname</p>
          <p className="text-[13px] text-ink-3">
            Hitung stok fisik di rak/gudang, lalu sistem menyesuaikan selisihnya otomatis dan mencatatnya di riwayat mutasi.
          </p>
        </div>
        {can('inventory.opname') ? (
          <Button fullWidth onClick={() => router.push('/inventory/opname')}>
            Mulai Stok Opname
          </Button>
        ) : (
          <p className="text-[13px] text-ink-3">Anda tidak punya izin melakukan stok opname.</p>
        )}
      </div>
      <div>
        <p className="mb-2 text-[11.5px] font-bold tracking-[0.08em] text-ink-3">PENYESUAIAN TERAKHIR</p>
        {recent.length === 0 ? (
          loading ? (
            <LoadingBlock />
          ) : (
            <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-ink-3">Belum pernah ada stok opname.</p>
          )
        ) : (
          <div className="space-y-2">
            {recent.map((item) => {
              const delta = item.stockAfter - item.stockBefore;
              return (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{item.productName}</p>
                    <p className="truncate text-[12.5px] text-ink-3">
                      {formatDateTimeShort(item.createdAt)}
                      {item.createdBy ? ` · ${item.createdBy}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn('font-bold', delta >= 0 ? 'text-success-700' : 'text-error-600')}>
                      {delta >= 0 ? '+' : '−'}
                      {formatQty(Math.abs(delta))} {item.unitName}
                    </p>
                    <p className="text-[12.5px] text-ink-3">
                      Sistem {formatQty(item.stockBefore)} → fisik {formatQty(item.stockAfter)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
