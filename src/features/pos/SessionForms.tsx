'use client';

import { useState } from 'react';

import { Alert } from '@/lib/alert';
import { useAppDispatch } from '@/store/hooks';
import { openSession } from '@/store/slices/cashierSessionSlice';
import { Button } from '@/components/ui/Button';
import { FormControl, Input } from '@/components/ui/Field';
import { ChevronDownIcon, UnlockIcon } from '@/components/icons/LineIcons';

export function OpenSessionForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const dispatch = useAppDispatch();
  const [openingCash, setOpeningCash] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(openingCash);
    if (!openingCash || Number.isNaN(parsed) || parsed < 0) return;
    setSubmitting(true);
    try {
      await dispatch(openSession(parsed)).unwrap();
      onDone();
    } catch {
      Alert.alert('Gagal', 'Sesi kasir tidak bisa dibuka.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="mb-2 flex items-center gap-2 text-lg font-bold text-ink">
        <UnlockIcon size={17} /> Buka Sesi Kasir
      </p>
      <p className="mb-4 text-sm text-ink-2">
        Hitung dulu uang tunai yang ada di laci, lalu masukkan jumlahnya di bawah. Ini jadi patokan buat menghitung
        selisih kas saat sesi ditutup nanti.
      </p>
      <FormControl label="Modal awal (kas di laci)" isRequired>
        <Input
          autoFocus
          inputMode="numeric"
          value={openingCash}
          onChange={(e) => setOpeningCash(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="0"
        />
      </FormControl>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} className="min-w-[90px]">
          Batal
        </Button>
        <Button type="submit" loading={submitting} disabled={!openingCash} className="min-w-[90px]">
          Buka
        </Button>
      </div>
    </form>
  );
}

export function DiscountForm({
  discountType,
  onChangeDiscountType,
  discountValue,
  onChangeDiscountValue,
  ppnEnabled,
  taxRatePercent,
  onDone,
}: {
  discountType: 'percent' | 'amount';
  onChangeDiscountType: () => void;
  discountValue: string;
  onChangeDiscountValue: (value: string) => void;
  ppnEnabled: boolean;
  taxRatePercent: number;
  onDone: () => void;
}) {
  return (
    <div>
      <p className="mb-4 text-lg font-bold text-ink">% Diskon & Pajak</p>
      <p className="mb-1.5 text-sm font-semibold text-ink">Diskon (F7)</p>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={onChangeDiscountType}
          className="flex min-w-[72px] cursor-pointer items-center justify-center gap-1 rounded-md border-[1.5px] border-gray-300 bg-white text-sm font-semibold shadow-md"
        >
          {discountType === 'percent' ? '%' : 'Rp'}
          <ChevronDownIcon size={12} className="text-ink-3" />
        </button>
        <Input
          autoFocus
          wrapperClassName="flex-1"
          inputMode="numeric"
          value={discountValue}
          onChange={(e) => onChangeDiscountValue(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="0"
        />
      </div>
      <div className="mb-5 flex items-center justify-between rounded-lg bg-gray-50 p-3">
        <div>
          <p className="text-sm font-semibold text-ink">PPN {taxRatePercent}%</p>
          <p className="text-[12.5px] text-ink-3">Diatur di Pengaturan → Pembayaran & PPN</p>
        </div>
        <span className={`text-sm font-semibold ${ppnEnabled ? 'text-success-600' : 'text-ink-3'}`}>
          {ppnEnabled ? 'Aktif' : 'Tidak aktif'}
        </span>
      </div>
      <Button fullWidth onClick={onDone}>
        Selesai
      </Button>
    </div>
  );
}
