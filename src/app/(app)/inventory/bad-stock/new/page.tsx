'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import * as inventoryApi from '@/api/inventoryApi';
import * as productsApi from '@/api/productsApi';
import { apiErrorMessage } from '@/api/errors';
import type { BadStockReason, ProductUnit, StockItem } from '@/types/models';
import { Alert } from '@/lib/alert';
import { cn } from '@/lib/cn';
import { photoProblem, pickPhoto } from '@/lib/pickPhoto';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ChevronRightIcon } from '@/components/icons/LineIcons';
import { REASONS, qty, rupiah } from '@/features/inventory/labels';
import { SearchBox } from '@/features/inventory/shared';

const label = 'mb-2 mt-6 block text-[11.5px] font-bold tracking-[0.08em] text-ink-3 first:mt-0';

/** Laporkan barang rusak, kedaluwarsa, hilang, cacat, atau retur pembeli, dengan foto opsional. */
export default function BadStockFormPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<StockItem[]>([]);
  const [product, setProduct] = useState<StockItem | null>(null);
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [unit, setUnit] = useState<ProductUnit | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState<BadStockReason>('DAMAGED');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    inventoryApi.fetchStock().then((s) => setCatalog(s.items)).catch(() => setCatalog([]));
  }, []);

  useEffect(() => {
    if (!photo) return setPhotoUrl(null);
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((p) => !q || p.productName.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 40);
  }, [catalog, search]);

  const amount = Number(quantity || 0);
  const baseAmount = amount * (unit?.conversionToBase ?? 1);
  const lossValue = product?.costPrice ? baseAmount * product.costPrice : null;
  const canSubmit = !!product && !!unit && amount > 0 && baseAmount <= (product?.stock ?? 0);

  const pickProduct = async (item: StockItem) => {
    setPickerOpen(false);
    setSearch('');
    setProduct(item);
    const list = await productsApi.fetchProductUnits(item.productId).catch(() => []);
    setUnits(list);
    setUnit(list.find((u) => u.baseUnit) ?? list[0] ?? null);
  };

  const choosePhoto = async () => {
    const file = await pickPhoto();
    if (!file) return;
    const problem = photoProblem(file);
    if (problem) return Alert.alert('Foto tidak valid', problem);
    setPhoto(file);
  };

  const submit = async () => {
    if (!product || !unit) return;
    setSaving(true);
    try {
      const saved = await inventoryApi.reportBadStock({
        productId: product.productId,
        unitId: unit.unitId,
        quantity: amount,
        reason,
        notes: notes.trim() || undefined,
      });
      if (photo) {
        try {
          await inventoryApi.uploadBadStockPhoto(saved.id, photo);
        } catch (error) {
          Alert.alert('Foto belum tersimpan', apiErrorMessage(error, 'Laporan tersimpan, tetapi foto gagal diunggah.'));
        }
      }
      Alert.alert(
        'Bad stock tercatat',
        saved.status === 'PENDING'
          ? 'Laporan menunggu persetujuan Kepala Toko. Stok dikurangi setelah disetujui.'
          : 'Stok sudah dikurangi dan barang dipisahkan.',
      );
      router.push('/inventory');
    } catch (error) {
      Alert.alert('Gagal', apiErrorMessage(error, 'Bad stock tidak bisa dicatat.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Catat Bad Stock" subtitle="Barang rusak, kedaluwarsa, hilang, atau retur" backHref="/inventory" />
      <PageBody>
        <div className="mx-auto max-w-[640px] rounded-2xl border border-line bg-white p-5 shadow-card tab:p-7">
          <span className={label}>PRODUK</span>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-line p-3.5 text-left hover:border-primary-300"
          >
            {product ? (
              <span>
                <span className="block font-semibold text-ink">{product.productName}</span>
                <span className="block text-[12.5px] text-ink-3">
                  Stok saat ini {qty(product.stock)} {product.baseUnitName}
                </span>
              </span>
            ) : (
              <span className="text-ink-3">Pilih produk…</span>
            )}
            <ChevronRightIcon size={18} className="text-gray-400" />
          </button>

          {product ? (
            <>
              <span className={label}>JUMLAH</span>
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3">
                <input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value.replace(/[^0-9.]/g, ''))}
                  inputMode="decimal"
                  className="w-24 rounded-md border border-gray-300 px-3 py-2 text-center text-lg font-bold outline-none focus:border-primary-600"
                />
                <div className="flex flex-wrap gap-2">
                  {units.map((u) => (
                    <button
                      key={u.unitId}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={cn(
                        'cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-semibold',
                        u.unitId === unit?.unitId ? 'border-navy-900 bg-navy-900 text-white' : 'border-line text-ink-2',
                      )}
                    >
                      {u.unitName}
                    </button>
                  ))}
                </div>
              </div>
              {baseAmount > product.stock ? (
                <p className="mt-1.5 text-[12.5px] text-error-600">
                  Melebihi stok yang ada ({qty(product.stock)} {product.baseUnitName}).
                </p>
              ) : lossValue !== null ? (
                <p className="mt-1.5 text-[12.5px] text-ink-3">Perkiraan kerugian {rupiah(lossValue)} (harga modal)</p>
              ) : null}
            </>
          ) : null}

          <span className={label}>ALASAN</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {REASONS.map((r) => {
              const active = r.value === reason;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-1 rounded-lg border-[1.5px] px-2 py-3 text-[12.5px] font-semibold transition',
                    active ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-line text-ink-2 hover:border-primary-200',
                  )}
                >
                  <span className="text-lg">{r.emoji}</span>
                  {r.label}
                </button>
              );
            })}
          </div>

          <span className={label}>CATATAN & FOTO BUKTI (OPSIONAL)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Mis. kemasan sobek saat bongkar muat"
            maxLength={500}
            className="min-h-24 w-full rounded-lg border border-line p-3 outline-none focus:border-primary-600"
          />
          <button
            type="button"
            onClick={choosePhoto}
            className="mt-2 flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 text-sm text-ink-3 hover:border-primary-300"
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="size-full object-cover" />
            ) : (
              '📷 Tambah foto bukti'
            )}
          </button>
          {photo ? (
            <button type="button" onClick={() => setPhoto(null)} className="mt-1 cursor-pointer text-[12.5px] font-semibold text-error-600">
              Hapus foto
            </button>
          ) : null}

          <Button fullWidth className="mt-6" onClick={submit} loading={saving} disabled={!canSubmit || saving}>
            Catat Bad Stock
          </Button>
        </div>
      </PageBody>

      <Modal isOpen={pickerOpen} onClose={() => setPickerOpen(false)} title="Pilih produk">
        <SearchBox value={search} onChange={setSearch} placeholder="Cari nama atau SKU" />
        <div className="mt-2 max-h-[360px] overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.productId}
              type="button"
              onClick={() => pickProduct(p)}
              className="block w-full cursor-pointer border-b border-gray-100 px-1 py-3 text-left hover:bg-gray-50"
            >
              <span className="block truncate font-semibold text-ink">{p.productName}</span>
              <span className="block text-[12.5px] text-ink-3">
                {p.sku} · stok {qty(p.stock)} {p.baseUnitName}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
