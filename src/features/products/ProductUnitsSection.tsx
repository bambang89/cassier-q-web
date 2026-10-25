'use client';

import { useEffect, useState } from 'react';

import type { Product, Unit } from '@/types/models';
import { Alert } from '@/lib/alert';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProductUnits, registerProductUnit } from '@/store/slices/productUnitsSlice';
import { Badge } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { CheckBox, FormControl, Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';

export function ProductUnitsSection({ product, allUnits }: { product: Product; allUnits: Unit[] }) {
  const dispatch = useAppDispatch();
  const productUnits = useAppSelector((state) => state.productUnits.byProductId[product.id]);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProductUnits(product.id));
  }, [dispatch, product.id]);

  const registeredIds = new Set((productUnits ?? []).map((u) => u.unitId));
  const availableUnits = allUnits.filter((u) => !registeredIds.has(u.id));

  return (
    <div className="mb-4">
      <p className="mb-1 text-base font-semibold text-ink">Satuan alternatif</p>
      <div className="rounded-xl border border-line bg-white p-4">
        {!productUnits ? (
          <p className="text-sm text-ink-3">Memuat...</p>
        ) : productUnits.length === 0 ? (
          <p className="text-sm text-ink-3">Cuma dijual dalam satuan dasar ({product.baseUnitName}).</p>
        ) : (
          productUnits.map((u) => (
            <div key={u.unitId} className="flex items-center justify-between gap-3 border-b border-gray-100 py-2.5 last:border-0">
              <div>
                <p className="font-medium text-ink">{u.unitName}</p>
                <p className="text-[13px] text-ink-2">
                  1 {u.unitName} = {u.conversionToBase} {product.baseUnitName}
                </p>
              </div>
              <div className="flex gap-1.5">
                {u.baseUnit ? <Badge variant="neutral">Dasar</Badge> : null}
                {u.saleUnit ? <Badge variant="success">Jual</Badge> : null}
                {u.purchaseUnit ? <Badge variant="primary">Restock</Badge> : null}
              </div>
            </div>
          ))
        )}
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFormOpen(true)} disabled={availableUnits.length === 0}>
          {availableUnits.length === 0 ? 'Semua satuan sudah didaftarkan' : '+ Tambah satuan alternatif'}
        </Button>
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)}>
        <RegisterUnitForm product={product} availableUnits={availableUnits} onDone={() => setFormOpen(false)} onCancel={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}

function RegisterUnitForm({
  product,
  availableUnits,
  onDone,
  onCancel,
}: {
  product: Product;
  availableUnits: Unit[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const dispatch = useAppDispatch();
  const [unitId, setUnitId] = useState<string | null>(null);
  const [conversionToBase, setConversionToBase] = useState('');
  const [saleUnit, setSaleUnit] = useState(true);
  const [purchaseUnit, setPurchaseUnit] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const selectedUnitName = availableUnits.find((u) => u.id === unitId)?.unitName ?? '';
  const ratio = Number(conversionToBase);
  const canSubmit = !!unitId && ratio > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId || !canSubmit) return;
    setSubmitting(true);
    try {
      await dispatch(registerProductUnit({ productId: product.id, payload: { unitId, conversionToBase: ratio, saleUnit, purchaseUnit } })).unwrap();
      onDone();
    } catch {
      Alert.alert('Gagal', 'Satuan tidak bisa didaftarkan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="mb-4 text-lg font-bold text-ink">Tambah Satuan Alternatif</p>
      <FormControl label="Satuan" isRequired>
        <Select
          value={unitId}
          onChange={setUnitId}
          placeholder="Pilih satuan"
          options={availableUnits.map((u) => ({ label: `${u.unitName} (${u.unitCode})`, value: u.id }))}
        />
      </FormControl>
      <FormControl
        label={`Rasio ke satuan dasar (${product.baseUnitName})`}
        isRequired
        helperText={selectedUnitName ? `mis. isi 24 kalau 1 ${selectedUnitName} = 24 ${product.baseUnitName}` : undefined}
      >
        <Input value={conversionToBase} onChange={(e) => setConversionToBase(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0" inputMode="decimal" />
      </FormControl>
      <div className="mb-2">
        <CheckBox value={saleUnit} onChange={setSaleUnit} label="Bisa dijual (muncul di kasir)" />
      </div>
      <div className="mb-5">
        <CheckBox value={purchaseUnit} onChange={setPurchaseUnit} label="Bisa dipakai untuk restock" />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} className="min-w-[90px]">
          Batal
        </Button>
        <Button type="submit" loading={submitting} disabled={!canSubmit} className="min-w-[90px]">
          Simpan
        </Button>
      </div>
    </form>
  );
}
