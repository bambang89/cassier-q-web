'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Alert } from '@/lib/alert';
import { forgotPassword } from '@/lib/store/slices/authSlice';
import { useAppDispatch } from '@/hooks/store';
import { Button } from '@/components/ui/Button';
import { FormControl, Input } from '@/components/ui/Field';
import { AuthLogo } from '@/components/common/AuthShell';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await dispatch(forgotPassword(username)).unwrap();
      Alert.alert('Terkirim', 'Kalau username terdaftar, token reset sudah dikirim ke email toko.', [
        { text: 'OK', onPress: () => router.push('/reset-password') },
      ]);
    } catch {
      Alert.alert('Gagal', 'Tidak bisa memproses permintaan, coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[500px] p-6">
      <AuthLogo />
      <h1 className="mb-1 text-center text-[22px] font-bold text-ink">Lupa kata sandi?</h1>
      <p className="mb-8 text-center text-ink-2">
        Jangan khawatir, ini bisa terjadi ke siapa saja. Masukkan username akun kamu — kalau terdaftar, token reset
        kata sandi akan dikirim ke email toko.
      </p>
      <FormControl label="Email atau Username">
        <Input placeholder="nama@bisnis.com" autoCapitalize="none" value={username} onChange={(e) => setUsername(e.target.value)} />
      </FormControl>
      <Button type="submit" loading={submitting} disabled={!username} fullWidth>
        Kirim Token Reset
      </Button>
      <p className="mt-5 text-center text-sm">
        <Link href="/login" className="font-semibold text-primary-600 hover:underline">
          Kembali ke halaman masuk
        </Link>
      </p>
    </form>
  );
}
