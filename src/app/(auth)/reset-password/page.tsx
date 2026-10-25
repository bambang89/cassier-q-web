'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Alert } from '@/lib/alert';
import { useAppDispatch } from '@/store/hooks';
import { resetPassword } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/Button';
import { FormControl, Input, PasswordInput } from '@/components/ui/Field';
import { AuthLogo } from '@/components/layout/AuthShell';

export default function ResetPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordsMatch = !confirmPassword || confirmPassword === newPassword;
  const canSubmit = !!token && newPassword.length >= 8 && confirmPassword.length >= 8 && passwordsMatch;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await dispatch(resetPassword({ token, newPassword })).unwrap();
      Alert.alert('Berhasil', 'Kata sandi sudah diganti, silakan masuk.', [
        { text: 'OK', onPress: () => router.push('/login') },
      ]);
    } catch {
      Alert.alert('Gagal', 'Token tidak valid/kedaluwarsa, atau kata sandi tidak memenuhi syarat.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[500px] p-6">
      <AuthLogo />
      <h1 className="mb-1 text-center text-[22px] font-bold text-ink">Buat kata sandi baru</h1>
      <p className="mb-8 text-center text-ink-2">
        Tempel token reset yang dikirim ke email toko, lalu masukkan kata sandi baru.
      </p>
      <FormControl label="Token reset">
        <Input placeholder="Token" autoCapitalize="none" value={token} onChange={(e) => setToken(e.target.value)} />
      </FormControl>
      <FormControl label="Kata sandi baru" helperText="Minimal 8 karakter">
        <PasswordInput placeholder="Kata sandi baru" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </FormControl>
      <FormControl
        label="Konfirmasi kata sandi baru"
        errorText={!passwordsMatch ? 'Kata sandi tidak sama' : undefined}
        isInvalid={!passwordsMatch}
      >
        <PasswordInput placeholder="Ulangi kata sandi baru" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </FormControl>
      <Button type="submit" loading={submitting} disabled={!canSubmit} fullWidth>
        Ganti Kata Sandi
      </Button>
      <p className="mt-5 text-center text-sm">
        <Link href="/login" className="font-semibold text-primary-600 hover:underline">
          Kembali ke halaman masuk
        </Link>
      </p>
    </form>
  );
}
