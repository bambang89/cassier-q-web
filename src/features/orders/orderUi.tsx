'use client';

import { useState } from 'react';

import type { OrderStatus } from '@/types/models';
import { Alert } from '@/lib/alert';
import { useAppDispatch } from '@/store/hooks';
import { voidOrder } from '@/store/slices/ordersSlice';
import { Button } from '@/components/ui/Button';
import { FormControl, TextArea } from '@/components/ui/Field';
import type { BadgeVariant } from '@/components/ui/Display';

export const STATUS_VARIANT: Record<string, BadgeVariant> = { PAID: 'success', VOID: 'error' };
const STATUS_LABEL: Record<string, string> = { PAID: 'Lunas', VOID: 'Dibatalkan' };

export function statusLabel(status: OrderStatus) {
  return STATUS_LABEL[status] ?? status;
}

export function money(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export function timeLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return date.toDateString() === today.toDateString()
    ? `Hari ini ${time}`
    : `${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} ${time}`;
}

export function dateTimeLabel(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

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
