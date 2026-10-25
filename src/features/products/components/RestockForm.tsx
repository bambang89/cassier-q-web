'use client';

import { useEffect, useState } from 'react';

import type { Product } from '@/types/models';
import { Alert } from '@/lib/alert';
import { fetchProductUnits } from '@/lib/store/slices/productUnitsSlice';
import { restockProduct } from '@/lib/store/slices/productsSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { resolvePurchaseUnitChoices } from '@/utils/productUnits';
import { Button } from '@/components/ui/Button';
import { FormControl, Input, Select } from '@/components/ui/Field';

export function RestockForm({ product, onDone, onCancel }: { product: Product; onDone: () => void; onCancel: () => void }) {
  const dispatch = useAppDispatch();
  const units = useAppSelector((state) => state.productUnits.byProductId[product.id]);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [unitId, setUnitId] = useState(product.baseUnitId);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!units) dispatch(fetchProductUnits(product.id));
  }, [dispatch, product.id, units]);

  const choices = resolvePurchaseUnitChoices(units ?? [], product);
  const selectedUnitName = choices.find((c) => c.unitId === unitId)?.unitName ?? product.baseUnitName;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(quantity);
    if (!parsed || parsed <= 0) return;
    setSubmitting(true);
    try {
      await dispatch(restockProduct({ id: product.id, payload: { unitId, quantity: parsed, notes: notes || undefined } })).unwrap();
      onDone();
    } catch {
      Alert.alert('Gagal', 'Restock gagal, coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="mb-4 text-lg font-bold text-ink">Tambah Stok — {product.productName}</p>
      {choices.length > 1 ? (
        <FormControl label="Satuan restock">
          <Select value={unitId} onChange={setUnitId} options={choices.map((c) => ({ label: c.unitName, value: c.unitId }))} />
        </FormControl>
      ) : null}
      <FormControl label={`Jumlah (${selectedUnitName})`}>
        <Input autoFocus inputMode="decimal" value={quantity} onChange={(e) => setQuantity(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0" />
      </FormControl>
      <FormControl label="Catatan (opsional)">
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="mis. pembelian dari supplier X" />
      </FormControl>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} className="min-w-[90px]">
          Batal
        </Button>
        <Button type="submit" loading={submitting} disabled={!quantity} className="min-w-[90px]">
          Simpan
        </Button>
      </div>
    </form>
  );
}
