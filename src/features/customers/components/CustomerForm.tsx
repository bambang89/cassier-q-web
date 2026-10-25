'use client';

import { useState } from 'react';

import type { Customer } from '@/types/models';
import { Alert } from '@/lib/alert';
import { createCustomer, recordCustomerPayment, updateCustomer } from '@/lib/store/slices/customersSlice';
import { useAppDispatch } from '@/hooks/store';
import { Button } from '@/components/ui/Button';
import { FormControl, Input } from '@/components/ui/Field';
import { CreditCardIcon } from '@/components/ui/icons/DataIcons';

function Actions({ onCancel, submitting, disabled }: { onCancel: () => void; submitting: boolean; disabled: boolean }) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" onClick={onCancel} className="min-w-[90px]">
        Batal
      </Button>
      <Button type="submit" loading={submitting} disabled={disabled} className="min-w-[90px]">
        Simpan
      </Button>
    </div>
  );
}

export function CustomerForm({ customer, onDone, onCancel }: { customer?: Customer; onDone: () => void; onCancel: () => void }) {
  const dispatch = useAppDispatch();
  const [customerCode, setCustomerCode] = useState(customer?.customerCode ?? '');
  const [name, setName] = useState(customer?.name ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [address, setAddress] = useState(customer?.address ?? '');
  const [creditLimit, setCreditLimit] = useState(customer ? String(customer.creditLimit) : '');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerCode || !name) return;
    setSubmitting(true);
    try {
      const payload = {
        customerCode,
        name,
        phone: phone || undefined,
        address: address || undefined,
        creditLimit: creditLimit ? Number(creditLimit) : undefined,
      };
      if (customer) await dispatch(updateCustomer({ id: customer.id, payload })).unwrap();
      else await dispatch(createCustomer(payload)).unwrap();
      onDone();
    } catch {
      Alert.alert('Gagal', 'Data pelanggan tidak bisa disimpan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="mb-4 text-lg font-bold text-ink">{customer ? 'Ubah Pelanggan' : 'Pelanggan Baru'}</p>
      <div className="grid gap-x-3 sm:grid-cols-2">
        <FormControl label="Kode pelanggan" isRequired helperText="mis. CUST-001">
          <Input autoFocus value={customerCode} onChange={(e) => setCustomerCode(e.target.value.toUpperCase())} placeholder="mis. CUST-001" />
        </FormControl>
        <FormControl label="Nama" isRequired>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama pelanggan" />
        </FormControl>
      </div>
      <FormControl label="No. HP">
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Opsional" type="tel" />
      </FormControl>
      <FormControl label="Alamat">
        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Opsional" />
      </FormControl>
      <FormControl label="Limit kredit (utang maksimal)" helperText="Kosongkan kalau tidak mau membatasi jumlah utang pelanggan ini">
        <Input value={creditLimit} onChange={(e) => setCreditLimit(e.target.value.replace(/\D/g, ''))} placeholder="0" inputMode="numeric" leftElement={<span className="text-ink-3">Rp</span>} />
      </FormControl>
      <Actions onCancel={onCancel} submitting={submitting} disabled={!customerCode || !name} />
    </form>
  );
}

export function RecordPaymentForm({
  customerId,
  customerName,
  maxAmount,
  onDone,
  onCancel,
}: {
  customerId: string;
  customerName: string;
  maxAmount: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const dispatch = useAppDispatch();
  const [amount, setAmount] = useState(String(maxAmount));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    setSubmitting(true);
    try {
      await dispatch(recordCustomerPayment({ customerId, amount: parsed, notes: notes || undefined })).unwrap();
      onDone();
    } catch {
      Alert.alert('Gagal', 'Pembayaran tidak bisa dicatat.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="mb-2 flex items-center gap-2 text-lg font-bold text-ink">
        <CreditCardIcon size={16} /> Catat Pembayaran
      </p>
      <p className="mb-4 text-sm text-ink-2">
        {customerName} melunasi sebagian/seluruh utangnya. Sisa utang saat ini: Rp {maxAmount.toLocaleString('id-ID')}.
      </p>
      <FormControl label="Jumlah dibayar" isRequired>
        <Input autoFocus inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} leftElement={<span className="text-ink-3">Rp</span>} />
      </FormControl>
      <FormControl label="Catatan (opsional)">
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="mis. dibayar tunai di toko" />
      </FormControl>
      <Actions onCancel={onCancel} submitting={submitting} disabled={!amount} />
    </form>
  );
}
