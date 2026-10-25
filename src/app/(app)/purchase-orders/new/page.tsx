'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { CreatePurchaseOrderItemPayload } from '@/api/purchaseOrdersApi';
import type { Product } from '@/types/models';
import { Alert } from '@/lib/alert';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSuppliers } from '@/store/slices/suppliersSlice';
import { fetchProducts } from '@/store/slices/productsSlice';
import { fetchProductUnits } from '@/store/slices/productUnitsSlice';
import { createPurchaseOrder } from '@/store/slices/purchaseOrdersSlice';
import { resolvePurchaseUnitChoices } from '@/utils/productUnits';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { FormControl, Input, Select, TextArea } from '@/components/ui/Field';
import { PlusIcon, ReceiptIcon, TrashIcon } from '@/components/icons/LineIcons';

type LineDraft = { key: string; productId: string | null; unitId: string | null; quantity: string; unitCost: string };

let lineKeySeq = 0;
function newLine(): LineDraft {
  lineKeySeq += 1;
  return { key: `line-${lineKeySeq}`, productId: null, unitId: null, quantity: '', unitCost: '' };
}

export default function PurchaseOrderFormPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const suppliers = useAppSelector((state) => state.suppliers.items);
  const products = useAppSelector((state) => state.products.items);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineDraft[]>(() => [newLine()]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchSuppliers());
    dispatch(fetchProducts({}));
  }, [dispatch]);

  const activeSuppliers = useMemo(() => suppliers.filter((s) => s.active), [suppliers]);
  const updateLine = (key: string, patch: Partial<LineDraft>) => setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const removeLine = (key: string) => setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev));

  const validLines = lines.filter((l) => l.productId && l.unitId && Number(l.quantity) > 0 && Number(l.unitCost) >= 0);
  const estimatedTotal = validLines.reduce((sum, l) => sum + Number(l.quantity) * Number(l.unitCost), 0);
  const canSubmit = !!supplierId && validLines.length > 0;

  const onSubmit = async () => {
    if (!supplierId) return;
    if (validLines.length === 0) {
      Alert.alert('Belum ada barang', 'Isi minimal satu baris barang (produk, satuan, jumlah, harga beli).');
      return;
    }
    setSubmitting(true);
    try {
      const items: CreatePurchaseOrderItemPayload[] = validLines.map((l) => ({
        productId: l.productId!,
        unitId: l.unitId!,
        quantity: Number(l.quantity),
        unitCost: Number(l.unitCost),
      }));
      const po = await dispatch(createPurchaseOrder({ supplierId, expectedDate: expectedDate || undefined, notes: notes || undefined, items })).unwrap();
      router.replace(`/purchase-orders/${po.id}`);
    } catch {
      Alert.alert('Gagal', 'Purchase order tidak bisa dibuat. Cek kembali data yang diisi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Buat Purchase Order" backHref="/purchase-orders" />
      <PageBody>
        <div className="mx-auto grid max-w-[1080px] gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
              {activeSuppliers.length === 0 ? (
                <p className="mb-4 rounded-lg bg-warning-50 p-3 text-sm text-warning-700">
                  Belum ada pemasok aktif. Buat pemasok dulu lewat menu Pemasok sebelum bisa membuat PO.
                </p>
              ) : null}
              <div className="grid gap-x-3 sm:grid-cols-2">
                <FormControl label="Pemasok" isRequired>
                  <Select value={supplierId} onChange={setSupplierId} placeholder="Pilih pemasok" options={activeSuppliers.map((s) => ({ label: s.supplierName, value: s.id }))} />
                </FormControl>
                <FormControl label="Perkiraan tanggal datang" helperText="Opsional">
                  <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
                </FormControl>
              </div>
              <FormControl label="Catatan" className="mb-0">
                <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opsional" rows={3} />
              </FormControl>
            </section>

            <section>
              <p className="mb-2 flex items-center gap-2 text-lg font-bold text-ink">
                <ReceiptIcon size={15} className="text-ink-2" /> Daftar Barang
              </p>
              <div className="space-y-3">
                {lines.map((line, index) => (
                  <POLineRow
                    key={line.key}
                    index={index}
                    line={line}
                    products={products}
                    onChange={(patch) => updateLine(line.key, patch)}
                    onRemove={() => removeLine(line.key)}
                    removable={lines.length > 1}
                  />
                ))}
              </div>
              <Button variant="outline" size="sm" leftIcon={<PlusIcon size={14} />} className="mt-3" onClick={() => setLines((prev) => [...prev, newLine()])}>
                Tambah Baris Barang
              </Button>
            </section>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-0 lg:self-start">
            <div className="rounded-2xl bg-[linear-gradient(135deg,#0B1F33_0%,#123E7A_100%)] p-5 text-white shadow-lg">
              <p className="text-[11.5px] font-semibold tracking-[0.1em] text-white/60">PERKIRAAN TOTAL PEMBELIAN</p>
              <p className="mt-1 text-[28px] font-extrabold">Rp {estimatedTotal.toLocaleString('id-ID')}</p>
              <p className="mt-1 text-[12.5px] text-white/70">{validLines.length} baris barang lengkap</p>
            </div>
            <Button fullWidth onClick={onSubmit} loading={submitting} disabled={!canSubmit}>
              Buat PO
            </Button>
          </aside>
        </div>
      </PageBody>
    </>
  );
}

function POLineRow({
  index,
  line,
  products,
  onChange,
  onRemove,
  removable,
}: {
  index: number;
  line: LineDraft;
  products: Product[];
  onChange: (patch: Partial<LineDraft>) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  const dispatch = useAppDispatch();
  const product = products.find((p) => p.id === line.productId);
  const productUnits = useAppSelector((state) => (line.productId ? state.productUnits.byProductId[line.productId] : undefined));

  useEffect(() => {
    if (line.productId && !productUnits) dispatch(fetchProductUnits(line.productId));
  }, [dispatch, line.productId, productUnits]);

  const unitChoices = product ? resolvePurchaseUnitChoices(productUnits ?? [], product) : [];
  const lineTotal = (Number(line.quantity) || 0) * (Number(line.unitCost) || 0);

  return (
    <div className="animate-fade-in rounded-xl border border-line bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-2">Barang #{index + 1}</p>
        {removable ? (
          <Button variant="ghost" size="sm" leftIcon={<TrashIcon size={14} />} onClick={onRemove} className="text-ink-2">
            Hapus
          </Button>
        ) : null}
      </div>
      <div className="grid gap-x-3 md:grid-cols-[2fr_1fr]">
        <FormControl label="Produk" isRequired>
          <Select value={line.productId} onChange={(v) => onChange({ productId: v, unitId: null })} placeholder="Pilih produk" options={products.map((p) => ({ label: p.productName, value: p.id }))} />
        </FormControl>
        <FormControl label="Satuan beli" isRequired>
          <Select value={line.unitId} onChange={(v) => onChange({ unitId: v })} placeholder="Satuan" disabled={!product} options={unitChoices.map((u) => ({ label: u.unitName, value: u.unitId }))} />
        </FormControl>
        <FormControl label="Harga beli per satuan" isRequired className="mb-0">
          <Input inputMode="numeric" value={line.unitCost} onChange={(e) => onChange({ unitCost: e.target.value.replace(/\D/g, '') })} placeholder="0" leftElement={<span className="text-ink-3">Rp</span>} />
        </FormControl>
        <FormControl label="Jumlah" isRequired className="mb-0">
          <Input inputMode="decimal" value={line.quantity} onChange={(e) => onChange({ quantity: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="0" />
        </FormControl>
      </div>
      {lineTotal > 0 ? <p className="mt-2 text-right text-[13px] font-semibold text-primary-600">Subtotal: Rp {lineTotal.toLocaleString('id-ID')}</p> : null}
    </div>
  );
}
