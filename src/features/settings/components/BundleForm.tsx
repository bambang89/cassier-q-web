'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { Product, ProductUnit } from '@/types/models';
import * as productsApi from '@/services/productsApi';
import * as bundlesApi from '@/services/bundlesApi';
import { Alert } from '@/lib/alert';
import { fetchCategories } from '@/lib/store/slices/categoriesSlice';
import { fetchProducts } from '@/lib/store/slices/productsSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { apiErrorMessage } from '@/utils/apiErrors';
import { cn } from '@/utils/cn';
import { isBundle } from '@/utils/bundles';
import { formatRupiah } from '@/utils/format';
import { PageBody, PageHeader } from '@/components/common/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Display';
import { FormControl, Input, Select, TextArea } from '@/components/ui/Field';
import { SectionCard } from '@/components/ui/SectionCard';
import { BoxIcon } from '@/components/ui/icons/NavIcons';
import { TrashIcon, PlusIcon } from '@/components/ui/icons/ActionIcons';
import { SearchBox } from '@/features/inventory/components/shared';
import { generateSku } from '@/features/products/utils';
import type { DraftItem } from '@/features/settings/types';

/** Buat atau ubah paket bundling (khusus Kepala Toko). */
export function BundleForm({ editing }: { editing?: Product }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isManager } = useMenuAccess();
  const categories = useAppSelector((state) => state.categories.items);
  const [name, setName] = useState(editing?.productName ?? '');
  const [sku, setSku] = useState(editing?.sku ?? '');
  const [barcode, setBarcode] = useState(editing?.barcode ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(editing?.categoryId ?? null);
  const [price, setPrice] = useState(editing ? String(editing.sellingPrice) : '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    productsApi
      .fetchProducts({ size: 500 })
      .then((page) => setCatalog(page.content.filter((p) => !isBundle(p) && p.status === 'ACTIVE')))
      .catch(() => setCatalog([]));
  }, [dispatch]);

  // Mode ubah: susun ulang baris isi setelah katalog (harga) termuat.
  useEffect(() => {
    if (!editing?.bundleItems || catalog.length === 0 || items.length > 0) return;
    Promise.all(
      editing.bundleItems.map(async (b) => {
        const product = catalog.find((p) => p.id === b.productId);
        const units = await productsApi.fetchProductUnits(b.productId).catch(() => []);
        const unit = units.find((u) => u.unitId === b.unitId);
        return {
          productId: b.productId,
          productName: b.productName,
          unitId: b.unitId,
          unitName: b.unitName,
          conversionToBase: unit?.conversionToBase ?? (b.quantity ? b.quantityBase / b.quantity : 1),
          quantity: Number(b.quantity),
          basePrice: product?.sellingPrice ?? 0,
          stockBase: b.stockBase,
          units,
        } satisfies DraftItem;
      }),
    ).then(setItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, editing]);

  const normalPrice = items.reduce((sum, i) => sum + i.basePrice * i.conversionToBase * i.quantity, 0);
  const bundlePrice = Number(price || 0);
  const savingAmount = normalPrice - bundlePrice;
  const savingPercent = normalPrice > 0 ? Math.round((savingAmount / normalPrice) * 100) : 0;
  const available = items.length ? Math.max(0, Math.min(...items.map((i) => Math.floor(i.stockBase / (i.conversionToBase * i.quantity || 1))))) : 0;

  const pickerResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog
      .filter((p) => p.id !== editing?.id && !items.some((i) => i.productId === p.id))
      .filter((p) => !q || p.productName.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 40);
  }, [catalog, search, items, editing?.id]);

  const canSubmit = !!(name.trim() && sku.trim() && categoryId && price !== '' && items.length > 0);

  const addItem = async (product: Product) => {
    setPickerOpen(false);
    setSearch('');
    const units = await productsApi.fetchProductUnits(product.id).catch(() => []);
    const base = units.find((u) => u.baseUnit) ?? units[0];
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.productName,
        unitId: base?.unitId ?? product.baseUnitId,
        unitName: base?.unitName ?? product.baseUnitName,
        conversionToBase: base?.conversionToBase ?? 1,
        quantity: 1,
        basePrice: product.sellingPrice,
        stockBase: product.stockQuantity,
        units,
      },
    ]);
  };

  const patchItem = (productId: string, patch: Partial<DraftItem>) => setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, ...patch } : i)));

  const onSave = async () => {
    if (!categoryId) return;
    setSaving(true);
    const payload = {
      sku: sku.trim(),
      barcode: barcode.trim() || undefined,
      productName: name.trim(),
      categoryId,
      description: description.trim() || undefined,
      sellingPrice: bundlePrice,
      items: items.map((i) => ({ productId: i.productId, unitId: i.unitId, quantity: i.quantity })),
    };
    try {
      if (editing) await bundlesApi.updateBundle(editing.id, payload);
      else await bundlesApi.createBundle(payload);
      dispatch(fetchProducts({}));
      router.push('/bundles');
    } catch (error) {
      Alert.alert('Gagal', apiErrorMessage(error, 'Paket tidak bisa disimpan.'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!editing) return;
    try {
      await bundlesApi.deleteBundle(editing.id);
      setConfirmDelete(false);
      dispatch(fetchProducts({}));
      router.push('/bundles');
    } catch (error) {
      Alert.alert('Gagal', apiErrorMessage(error, 'Paket tidak bisa dihapus.'));
    }
  };

  if (!isManager) {
    return (
      <>
        <PageHeader title="Paket Bundling" backHref="/bundles" />
        <EmptyState icon={BoxIcon} title="Khusus Kepala Toko" description="Hanya Kepala Toko yang bisa membuat atau mengubah paket." />
      </>
    );
  }

  const saveButton = (
    <Button fullWidth onClick={onSave} loading={saving} disabled={!canSubmit || saving}>
      {editing ? 'Simpan Perubahan' : 'Buat Paket'}
    </Button>
  );

  return (
    <>
      <PageHeader title={editing ? 'Ubah Paket' : 'Paket Baru'} backHref="/bundles" />
      <PageBody>
        <div className="mx-auto grid max-w-[1080px] gap-5 lg:grid-cols-[1fr_360px]">
          <div className="order-2 space-y-5 lg:order-1">
            <SectionCard title={`Isi paket (${items.length})`}>
              {items.length === 0 ? (
                <p className="py-3 text-sm text-ink-3">Belum ada isi. Tambahkan produk yang akan digabung dalam paket ini.</p>
              ) : (
                items.map((item) => (
                  <div key={item.productId} className="space-y-2 border-b border-gray-100 py-3 first:pt-0 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">{item.productName}</p>
                        <p className="text-[12.5px] text-ink-3">
                          {formatRupiah(item.basePrice * item.conversionToBase)} / {item.unitName} · stok {item.stockBase}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((i) => i.productId !== item.productId))}
                        aria-label={`Hapus ${item.productName}`}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-md bg-error-50 text-error-600 hover:bg-error-100"
                      >
                        <TrashIcon size={15} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {(item.units.length ? item.units : [{ unitId: item.unitId, unitName: item.unitName, conversionToBase: item.conversionToBase } as ProductUnit]).map((u) => (
                          <button
                            key={u.unitId}
                            type="button"
                            onClick={() => patchItem(item.productId, { unitId: u.unitId, unitName: u.unitName, conversionToBase: u.conversionToBase })}
                            className={cn(
                              'cursor-pointer rounded-full border px-2.5 py-1 text-[12px] font-semibold',
                              u.unitId === item.unitId ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-line text-ink-2',
                            )}
                          >
                            {u.unitName}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center rounded-md border border-line">
                        <button type="button" onClick={() => patchItem(item.productId, { quantity: Math.max(1, item.quantity - 1) })} className="size-8 cursor-pointer text-lg font-bold text-primary-600" aria-label="Kurangi">
                          −
                        </button>
                        <input
                          value={String(item.quantity)}
                          onChange={(e) => patchItem(item.productId, { quantity: Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1) })}
                          inputMode="numeric"
                          className="w-10 text-center font-bold outline-none"
                        />
                        <button type="button" onClick={() => patchItem(item.productId, { quantity: item.quantity + 1 })} className="size-8 cursor-pointer text-lg font-bold text-primary-600" aria-label="Tambah">
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <Button variant="outline" leftIcon={<PlusIcon size={15} />} onClick={() => setPickerOpen(true)} className="mt-3">
                Tambah Produk ke Paket
              </Button>
            </SectionCard>

            <SectionCard title="Detail paket">
              <FormControl label="Nama paket" isRequired>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mis. Paket Sarapan" maxLength={200} />
              </FormControl>
              <div className="grid gap-x-3 sm:grid-cols-2">
                <FormControl label="Harga paket (Rp)" isRequired helperText={normalPrice > 0 ? `Harga normal isinya ${formatRupiah(normalPrice)}` : undefined}>
                  <Input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="25000" />
                </FormControl>
                <FormControl label="Kategori" isRequired>
                  <Select value={categoryId} onChange={setCategoryId} placeholder="Pilih kategori" options={categories.map((c) => ({ label: c.categoryName, value: c.id }))} />
                </FormControl>
                <FormControl label="SKU" isRequired>
                  <Input
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="PKT-001"
                    rightElement={
                      <button type="button" onClick={() => setSku(generateSku('PKT'))} className="cursor-pointer rounded-md bg-primary-50 px-2 py-1 text-[12.5px] font-bold text-primary-600">
                        Auto
                      </button>
                    }
                  />
                </FormControl>
                <FormControl label="Barcode">
                  <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Opsional" inputMode="numeric" />
                </FormControl>
              </div>
              <FormControl label="Deskripsi" className="mb-0">
                <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opsional" />
              </FormControl>
            </SectionCard>

            {editing ? (
              <Button variant="dangerOutline" onClick={() => setConfirmDelete(true)}>
                Hapus Paket
              </Button>
            ) : null}
          </div>

          <aside className="order-1 space-y-4 lg:sticky lg:top-0 lg:order-2 lg:self-start">
            <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0B1F33_0%,#122A44_55%,#1A3654_100%)] p-5 shadow-lg">
              <span className="absolute -top-6 -right-4 text-[88px] opacity-15">🎁</span>
              <p className="relative truncate text-[11.5px] font-semibold tracking-[0.1em] text-white/60">{name.trim() ? name.trim().toUpperCase() : 'PAKET BARU'}</p>
              <p className="relative text-[30px] leading-[38px] font-extrabold text-white">{formatRupiah(bundlePrice)}</p>
              <div className="relative mt-3 grid grid-cols-3 gap-2 border-t border-white/12 pt-3">
                <div>
                  <p className="text-[12px] text-white/60">Harga normal</p>
                  <p className={cn('font-semibold', normalPrice > bundlePrice ? 'text-white/70 line-through' : 'text-white')}>{formatRupiah(normalPrice)}</p>
                </div>
                <div>
                  <p className="text-[12px] text-white/60">Pembeli hemat</p>
                  <p className={cn('font-semibold', savingAmount > 0 ? 'text-[#7EE2B8]' : 'text-white')}>{savingAmount > 0 ? `${savingPercent}%` : '-'}</p>
                </div>
                <div>
                  <p className="text-[12px] text-white/60">Bisa dijual</p>
                  <p className="font-semibold text-white">{items.length ? `${available} paket` : '-'}</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">{saveButton}</div>
          </aside>
          <div className="order-3 lg:hidden">{saveButton}</div>
        </div>
      </PageBody>

      <Modal isOpen={pickerOpen} onClose={() => setPickerOpen(false)} title="Pilih produk isi paket">
        <SearchBox value={search} onChange={setSearch} placeholder="Cari nama atau SKU" />
        <div className="mt-2 max-h-[360px] overflow-y-auto">
          {pickerResults.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-3">Produk tidak ditemukan</p>
          ) : (
            pickerResults.map((p) => (
              <button key={p.id} type="button" onClick={() => addItem(p)} className="flex w-full cursor-pointer items-center gap-3 border-b border-gray-100 px-1 py-3 text-left hover:bg-gray-50">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">{p.productName}</span>
                  <span className="block text-[12.5px] text-ink-3">
                    {p.sku} · stok {p.stockQuantity} {p.baseUnitName}
                  </span>
                </span>
                <span className="text-sm font-semibold text-primary-700">{formatRupiah(p.sellingPrice)}</span>
              </button>
            ))
          )}
        </div>
      </Modal>

      <AlertDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Hapus paket?"
        description={`"${editing?.productName}" tidak akan muncul lagi di kasir. Stok produk isinya tidak berubah.`}
        confirmText="Hapus"
        isDanger
        onConfirm={onDelete}
      />
    </>
  );
}
