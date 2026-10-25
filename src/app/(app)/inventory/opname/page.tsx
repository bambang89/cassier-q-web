'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import * as inventoryApi from '@/api/inventoryApi';
import { apiErrorMessage } from '@/api/errors';
import type { StockItem } from '@/types/models';
import { Alert } from '@/lib/alert';
import { cn } from '@/lib/cn';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { LoadingBlock } from '@/components/ui/Spinner';
import { qty, rupiah } from '@/features/inventory/labels';
import { SearchBox } from '@/features/inventory/shared';

/**
 * Hitung stok: isi jumlah fisik produk yang dihitung; hanya baris yang berubah
 * yang dikirim. API menyetel stok ke jumlah fisik dan mencatat selisihnya.
 */
export default function StockOpnamePage() {
  const router = useRouter();
  const [items, setItems] = useState<StockItem[] | null>(null);
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    inventoryApi
      .fetchStock()
      .then((summary) => setItems(summary.items))
      .catch((error) => {
        setItems([]);
        Alert.alert('Gagal', apiErrorMessage(error, 'Daftar stok gagal dimuat.'));
      });
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter((i) => !q || i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
  }, [items, query]);

  const changes = useMemo(
    () =>
      (items ?? [])
        .filter((i) => counts[i.productId] !== undefined && counts[i.productId] !== '')
        .map((i) => ({ item: i, counted: Number(counts[i.productId]) }))
        .filter(({ item, counted }) => !Number.isNaN(counted) && counted !== item.stock),
    [items, counts],
  );
  const valueDiff = changes.reduce((sum, { item, counted }) => sum + (counted - item.stock) * (item.costPrice ?? 0), 0);

  const submit = () => {
    Alert.alert('Simpan stok opname?', `${changes.length} produk akan disesuaikan dengan jumlah fisik (selisih nilai ${rupiah(valueDiff)}).`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Simpan',
        onPress: async () => {
          setSaving(true);
          try {
            const result = await inventoryApi.submitOpname(
              changes.map(({ item, counted }) => ({ productId: item.productId, countedQuantity: counted })),
              notes.trim() || undefined,
            );
            Alert.alert('Stok opname tersimpan', `${result.lines.length} produk disesuaikan.`);
            router.push('/inventory');
          } catch (error) {
            Alert.alert('Gagal', apiErrorMessage(error, 'Stok opname tidak bisa disimpan.'));
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  return (
    <>
      <PageHeader title="Stok Opname" subtitle="Isi jumlah fisik yang berbeda dari sistem" backHref="/inventory" />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-line bg-white px-5 py-3 tab:px-6">
          <div className="mx-auto max-w-[860px]">
            <SearchBox value={query} onChange={setQuery} placeholder="Cari produk yang dihitung" />
          </div>
        </div>
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 py-4 tab:px-6">
          <div className="mx-auto max-w-[860px] overflow-hidden rounded-xl border border-line bg-white">
            {items === null ? (
              <LoadingBlock />
            ) : (
              visible.map((item) => {
                const typed = counts[item.productId];
                const diff = typed !== undefined && typed !== '' ? Number(typed) - item.stock : 0;
                return (
                  <div key={item.productId} className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{item.productName}</p>
                      <p className="text-[12.5px] text-ink-3">
                        Sistem: {qty(item.stock)} {item.baseUnitName}
                        {diff !== 0 ? (
                          <span className={cn('ml-2 font-bold', diff > 0 ? 'text-success-700' : 'text-error-600')}>
                            {`${diff > 0 ? '+' : '−'}${qty(Math.abs(diff))}`}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <input
                      value={typed ?? ''}
                      onChange={(e) => setCounts((prev) => ({ ...prev, [item.productId]: e.target.value.replace(/[^0-9.]/g, '') }))}
                      placeholder={qty(item.stock)}
                      inputMode="decimal"
                      aria-label={`Jumlah fisik ${item.productName}`}
                      className={cn(
                        'w-24 rounded-md border-[1.5px] px-2.5 py-2 text-right text-base font-semibold outline-none placeholder:font-normal placeholder:text-gray-300 focus:border-primary-600',
                        diff !== 0 ? 'border-warning-500 bg-warning-50' : 'border-gray-300',
                      )}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="border-t border-line bg-white px-5 py-3 tab:px-6">
          <div className="mx-auto flex max-w-[860px] flex-col gap-2 sm:flex-row">
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan opname (opsional)"
              maxLength={500}
              className="min-h-12 flex-1 rounded-lg border border-line px-3 outline-none focus:border-primary-600"
            />
            <Button onClick={submit} loading={saving} disabled={changes.length === 0 || saving} className="sm:min-w-64">
              {changes.length ? `Simpan ${changes.length} Penyesuaian` : 'Isi jumlah fisik yang berbeda'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
