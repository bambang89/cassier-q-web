'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import * as inventoryApi from '@/api/inventoryApi';
import type { StockStatus, StockSummary } from '@/types/models';
import { Badge, EmptyState } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { LoadingBlock } from '@/components/ui/Spinner';
import { LayersIcon } from '@/components/icons/LineIcons';
import { qty, rupiah } from './labels';
import { DataTable, FilterChips, SearchBox, StatTile } from './shared';

type Filter = 'ALL' | StockStatus;

const STATUS_BADGE: Record<StockStatus, { label: string; variant: 'error' | 'warning' | 'success' }> = {
  OUT: { label: 'Habis', variant: 'error' },
  LOW: { label: 'Menipis', variant: 'warning' },
  OK: { label: 'Aman', variant: 'success' },
};

/** Stok semua produk: ringkasan, filter status, dan pencarian. */
export function StockTab() {
  const [data, setData] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await inventoryApi.fetchStock());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.items ?? []).filter(
      (i) => (filter === 'ALL' || i.status === filter) && (!q || i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)),
    );
  }, [data, filter, query]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
        <StatTile label="Produk" value={String(data?.products ?? 0)} />
        <StatTile label="Habis" value={String(data?.outOfStock ?? 0)} tone="error" />
        <StatTile label="Menipis" value={String(data?.lowStock ?? 0)} tone="warning" />
        <div className="col-span-3 lg:col-span-1">
          <StatTile label="Nilai stok (harga modal)" value={rupiah(data?.totalValue ?? 0)} tone="success" />
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="lg:w-80">
          <SearchBox value={query} onChange={setQuery} placeholder="Cari nama atau SKU" />
        </div>
        <FilterChips<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'ALL', label: 'Semua', count: data?.products },
            { value: 'OUT', label: 'Habis', count: data?.outOfStock },
            { value: 'LOW', label: 'Menipis', count: data?.lowStock },
            { value: 'OK', label: 'Aman' },
          ]}
        />
        <Button variant="secondary" size="sm" className="lg:ml-auto" onClick={load} loading={loading}>
          Muat ulang
        </Button>
      </div>

      {items.length === 0 ? (
        loading ? (
          <LoadingBlock />
        ) : (
          <EmptyState icon={LayersIcon} title="Tidak ada produk" description="Belum ada produk dengan status ini." />
        )
      ) : (
        <>
          <div className="hidden tab:block">
            <DataTable
              head={
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Produk</th>
                  <th className="px-3 py-2.5 font-semibold">Kategori</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Nilai</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Stok</th>
                  <th className="w-28 px-5 py-2.5 font-semibold">Status</th>
                </tr>
              }
            >
              {items.map((item) => {
                const badge = STATUS_BADGE[item.status];
                return (
                  <tr key={item.productId}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-ink">{item.productName}</p>
                      <p className="text-[12.5px] text-ink-3">{item.sku}</p>
                    </td>
                    <td className="px-3 py-3 text-ink-2">{item.categoryName}</td>
                    <td className="px-3 py-3 text-right text-ink-2">{item.stockValue !== null ? rupiah(item.stockValue) : '—'}</td>
                    <td className="px-3 py-3 text-right font-bold text-ink">
                      {qty(item.stock)} <span className="font-medium text-ink-3">{item.baseUnitName}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          </div>
          <div className="space-y-2 tab:hidden">
            {items.map((item) => {
              const badge = STATUS_BADGE[item.status];
              return (
                <div key={item.productId} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{item.productName}</p>
                    <p className="truncate text-[12.5px] text-ink-3">
                      {item.sku} · {item.categoryName}
                      {item.stockValue !== null ? ` · ${rupiah(item.stockValue)}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-ink">
                      {qty(item.stock)} {item.baseUnitName}
                    </span>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
