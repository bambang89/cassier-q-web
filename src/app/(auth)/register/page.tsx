'use client';

import { useState } from 'react';
import Link from 'next/link';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/Button';
import { FormControl, Input, PasswordInput } from '@/components/ui/Field';
import { PersonIcon, StoreIcon } from '@/components/icons/LineIcons';
import { AuthLogo } from '@/components/layout/AuthShell';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [storeCode, setStoreCode] = useState('');
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isSubmitting = status === 'authenticating';
  const passwordsMatch = !confirmPassword || confirmPassword === password;
  const canSubmit = !!(
    storeCode &&
    storeName &&
    username &&
    name &&
    email &&
    password.length >= 8 &&
    confirmPassword.length >= 8 &&
    passwordsMatch
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    dispatch(
      register({
        storeCode,
        storeName,
        username,
        name,
        email,
        password,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
      }),
    );
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[560px] p-6">
      <AuthLogo />
      <h1 className="mb-1 text-center text-[22px] font-bold text-ink">Daftar Toko Baru</h1>
      <p className="mb-8 text-center text-ink-2">
        Isi data di bawah — akun pemilik toko langsung jadi begitu selesai daftar
      </p>

      <p className="mb-3 flex items-center gap-1.5 font-bold text-ink">
        <StoreIcon size={15} className="text-ink-2" /> Data Toko
      </p>
      <div className="grid gap-x-3 sm:grid-cols-2">
        <FormControl label="Kode toko" isRequired helperText="Bebas kamu tentukan">
          <Input placeholder="mis. TOKO001" value={storeCode} onChange={(e) => setStoreCode(e.target.value.toUpperCase())} />
        </FormControl>
        <FormControl label="Nama toko" isRequired>
          <Input placeholder="mis. Toko Berkah" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </FormControl>
      </div>
      <FormControl label="Alamat toko" helperText="Opsional — tampil di struk">
        <Input placeholder="Jalan, kelurahan, kecamatan, kota" value={address} onChange={(e) => setAddress(e.target.value)} />
      </FormControl>
      <FormControl label="No. telepon toko">
        <Input placeholder="Opsional" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </FormControl>

      <p className="mb-3 flex items-center gap-1.5 font-bold text-ink">
        <PersonIcon size={15} className="text-ink-2" /> Data Pemilik
      </p>
      <div className="grid gap-x-3 sm:grid-cols-2">
        <FormControl label="Nama lengkap" isRequired>
          <Input placeholder="Nama lengkap kamu" value={name} onChange={(e) => setName(e.target.value)} />
        </FormControl>
        <FormControl label="Username" isRequired helperText="Buat login, bukan nama">
          <Input
            placeholder="mis. budi123"
            autoCapitalize="none"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>
      </div>
      <FormControl label="Email" isRequired>
        <Input placeholder="nama@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormControl>
      <FormControl
        label="Kata Sandi"
        isRequired
        helperText="Minimal 8 karakter — ingat baik-baik, dipakai tiap kali masuk"
        errorText={error ?? undefined}
        isInvalid={!!error}
      >
        <PasswordInput placeholder="Buat kata sandi" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </FormControl>
      <FormControl
        label="Konfirmasi Kata Sandi"
        isRequired
        errorText={!passwordsMatch ? 'Kata sandi tidak sama' : undefined}
        isInvalid={!passwordsMatch}
      >
        <PasswordInput placeholder="Ulangi kata sandi" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </FormControl>

      <Button type="submit" loading={isSubmitting} disabled={!canSubmit} fullWidth className="mt-2">
        Daftar
      </Button>
      <p className="mt-5 text-center text-sm text-ink-2">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-semibold text-primary-600 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
