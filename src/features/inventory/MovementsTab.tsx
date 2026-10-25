'use client';

import { useCallback, useEffect, useState } from 'react';

import * as inventoryApi from '@/api/inventoryApi';
import type { StockMovementItem } from '@/types/models';
import { cn } from '@/lib/cn';
import { EmptyState } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { LoadingBlock } from '@/components/ui/Spinner';
import { HistoryIcon } from '@/components/icons/LineIcons';
import { MOVEMENT_TYPES, dateTime, qty } from './labels';
import { DataTable, FilterChips } from './shared';

const TYPES = [
  { value: '', label: 'Semua' },
  { value: 'SALE', label: 'Penjualan' },
  { value: 'STOCK_IN', label: 'Restock' },
  { value: 'PURCHASE', label: 'Terima PO' },
  { value: 'STOCK_OPNAME', label: 'Opname' },
  { value: 'BAD_STOCK', label: 'Bad stock' },
  { value: 'VOID_TRANSACTION', label: 'Void' },
];

/** Semua mutasi stok, terbaru dulu, dengan jumlah masuk/keluar dan stok sebelum → sesudah. */
export function MovementsTab() {
  const [type, setType] = useState('');
  const [items, setItems] = useState<StockMovementItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (nextPage = 0) => {
      setLoading(true);
      try {
        const result = await inventoryApi.fetchMovements({ type: type || undefined, page: nextPage, size: 30 });
        setItems((prev) => (nextPage === 0 ? result.content : [...prev, ...result.content]));
        setPage(result.page);
        setTotalPages(result.totalPages);
      } finally {
        setLoading(false);
      }
    },
    [type],
  );

  useEffect(() => {
    load(0);
  }, [load]);

  const rows = items.map((item) => {
    const delta = item.stockAfter - item.stockBefore;
    const meta = MOVEMENT_TYPES[item.movementType] ?? { label: item.movementType, sign: delta >= 0 ? 1 : -1 };
    return { item, delta, label: meta.label, incoming: delta >= 0 };
  });

  return (
    <div className="space-y-3">
      <FilterChips value={type} onChange={setType} options={TYPES} />
      {rows.length === 0 ? (
        loading ? (
          <LoadingBlock />
        ) : (
          <EmptyState icon={HistoryIcon} title="Belum ada mutasi" description="Keluar-masuk stok akan tercatat di sini." />
        )
      ) : (
        <>
          <div className="hidden tab:block">
            <DataTable
              head={
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Produk</th>
                  <th className="px-3 py-2.5 font-semibold">Jenis</th>
                  <th className="px-3 py-2.5 font-semibold">Waktu</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Jumlah</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Stok</th>
                </tr>
              }
            >
              {rows.map(({ item, delta, label, incoming }) => (
                <tr key={item.id}>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-ink">{item.productName}</p>
                    {item.notes ? <p className="max-w-80 truncate text-[12.5px] text-ink-3">{item.notes}</p> : null}
                  </td>
                  <td className="px-3 py-3 text-ink-2">{label}</td>
                  <td className="px-3 py-3 text-ink-2">
                    {dateTime(item.createdAt)}
                    {item.createdBy ? <span className="block text-[12px] text-ink-3">{item.createdBy}</span> : null}
                  </td>
                  <td className={cn('px-3 py-3 text-right font-bold', incoming ? 'text-success-700' : 'text-error-600')}>
                    {incoming ? '+' : '−'}
                    {qty(Math.abs(delta))}
                  </td>
                  <td className="px-5 py-3 text-right text-ink-3">
                    {qty(item.stockBefore)} → <span className="font-semibold text-ink">{qty(item.stockAfter)}</span>
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
          <div className="space-y-2 tab:hidden">
            {rows.map(({ item, delta, label, incoming }) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3.5">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-lg font-bold',
                    incoming ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-600',
                  )}
                >
                  {incoming ? '+' : '−'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{item.productName}</p>
                  <p className="truncate text-[12.5px] text-ink-2">
                    {label} · {dateTime(item.createdAt)}
                    {item.createdBy ? ` · ${item.createdBy}` : ''}
                  </p>
                  {item.notes ? <p className="truncate text-[12.5px] text-ink-3">{item.notes}</p> : null}
                </div>
                <div className="text-right">
                  <p className={cn('font-bold', incoming ? 'text-success-700' : 'text-error-600')}>
                    {incoming ? '+' : '−'}
                    {qty(Math.abs(delta))}
                  </p>
                  <p className="text-[12.5px] text-ink-3">
                    {qty(item.stockBefore)} → {qty(item.stockAfter)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {page + 1 < totalPages ? (
            <div className="flex justify-center">
              <Button variant="secondary" size="sm" loading={loading} onClick={() => load(page + 1)}>
                Muat lebih banyak
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
