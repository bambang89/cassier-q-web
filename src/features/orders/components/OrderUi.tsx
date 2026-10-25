'use client';

import { useState } from 'react';

import { Alert } from '@/lib/alert';
import { voidOrder } from '@/lib/store/slices/ordersSlice';
import { useAppDispatch } from '@/hooks/store';
import { Button } from '@/components/ui/Button';
import { FormControl, TextArea } from '@/components/ui/Field';

export function VoidForm({ orderId, onDone, onCancel }: { orderId: string; onDone: () => void; onCancel: () => void }) {
  const dispatch = useAppDispatch();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await dispatch(voidOrder({ id: orderId, reason: reason.trim() })).unwrap();
      onDone();
    } catch (error) {
      Alert.alert('Gagal', typeof error === 'string' ? error : 'Transaksi tidak bisa dibatalkan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="mb-1 text-lg font-bold text-ink">Batalkan Transaksi</p>
      <p className="mb-4 text-sm text-ink-2">Stok dikembalikan dan pembayaran ditandai refund.</p>
      <FormControl label="Alasan pembatalan" isRequired>
        <TextArea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="mis. salah input, barang dikembalikan" />
      </FormControl>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} className="min-w-[90px]">
          Batal
        </Button>
        <Button type="submit" variant="danger" loading={submitting} disabled={!reason.trim()} className="min-w-[90px]">
          Ya, Batalkan
        </Button>
      </div>
    </form>
  );
}
