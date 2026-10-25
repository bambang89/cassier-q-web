'use client';

import { useState } from 'react';

import { Alert } from '@/lib/alert';
import { closeSession } from '@/lib/store/slices/cashierSessionSlice';
import { changePassword } from '@/lib/store/slices/authSlice';
import { useAppDispatch } from '@/hooks/store';
import { Button } from '@/components/ui/Button';
import { FormControl, Input, PasswordInput } from '@/components/ui/Field';

export function CloseSessionForm({ sessionId, onDone, onCancel }: { sessionId: string; onDone: () => void; onCancel: () => void }) {
  const dispatch = useAppDispatch();
  const [actualCash, setActualCash] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(actualCash);
    if (!actualCash || Number.isNaN(parsed) || parsed < 0) return;
    setSubmitting(true);
    try {
      await dispatch(closeSession({ id: sessionId, actualCash: parsed, notes: notes || undefined })).unwrap();
      onDone();
    } catch {
      Alert.alert('Gagal', 'Sesi kasir tidak bisa ditutup.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="mb-1 text-lg font-bold text-ink">Tutup Sesi Kasir</p>
      <p className="mb-4 text-sm text-ink-2">Hitung uang tunai di laci, sistem mencatat selisihnya dengan kas yang seharusnya.</p>
      <FormControl label="Kas fisik yang dihitung" isRequired>
        <Input autoFocus inputMode="numeric" value={actualCash} onChange={(e) => setActualCash(e.target.value.replace(/\D/g, ''))} placeholder="0" leftElement={<span className="text-ink-3">Rp</span>} />
      </FormControl>
      <FormControl label="Catatan (opsional)">
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="mis. selisih karena kembalian" />
      </FormControl>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} className="min-w-[90px]">
          Batal
        </Button>
        <Button type="submit" loading={submitting} disabled={!actualCash} className="min-w-[90px]">
          Tutup
        </Button>
      </div>
    </form>
  );
}

export function ChangePasswordForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const dispatch = useAppDispatch();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = !!currentPassword && newPassword.length >= 8;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
      Alert.alert('Berhasil', 'Kata sandi sudah diganti.');
      onDone();
    } catch {
      Alert.alert('Gagal', 'Kata sandi saat ini salah, atau kata sandi baru tidak memenuhi syarat.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="mb-4 text-lg font-bold text-ink">Ganti Kata Sandi</p>
      <FormControl label="Kata sandi saat ini" isRequired>
        <PasswordInput autoFocus autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </FormControl>
      <FormControl label="Kata sandi baru" isRequired helperText="Minimal 8 karakter">
        <PasswordInput autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </FormControl>
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
