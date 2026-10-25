'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Alert } from '@/lib/alert';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { clearRememberedUsername, loadRememberedUsername, saveRememberedUsername } from '@/api/tokenStorage';
import { Button } from '@/components/ui/Button';
import { CheckBox, FormControl, Input, PasswordInput } from '@/components/ui/Field';
import { AuthLogo } from '@/components/layout/AuthShell';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const isSubmitting = status === 'authenticating';

  useEffect(() => {
    loadRememberedUsername().then((remembered) => {
      if (remembered) setUsername(remembered);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login({ username, password }));
    if (login.fulfilled.match(result)) {
      if (rememberMe) await saveRememberedUsername(username);
      else await clearRememberedUsername();
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full max-w-[500px] p-6">
      <AuthLogo />
      <div className="animate-fade-in [animation-delay:120ms]">
        <h1 className="mb-1 text-center text-[22px] font-bold text-ink">Selamat datang kembali</h1>
        <p className="mb-8 text-center text-ink-2">Masuk untuk mengelola bisnis Anda.</p>
      </div>

      <div className="animate-fade-in [animation-delay:220ms]">
        <FormControl label="Email atau Username">
          <Input
            placeholder="nama@bisnis.com"
            autoCapitalize="none"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>
        <FormControl label="Password" errorText={error ?? undefined} isInvalid={!!error}>
          <PasswordInput
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>

        <div className="mb-5 flex items-center justify-between">
          <CheckBox value={rememberMe} onChange={setRememberMe} label="Ingat saya" />
          <Link href="/forgot-password" className="font-semibold text-primary-600 hover:underline">
            Lupa password?
          </Link>
        </div>

        <Button type="submit" loading={isSubmitting} disabled={!username || !password} fullWidth>
          Masuk
        </Button>

        <div className="my-5 flex items-center gap-3">
          <hr className="flex-1 border-line" />
          <span className="text-sm text-ink-3">ATAU</span>
          <hr className="flex-1 border-line" />
        </div>

        <Button
          variant="outline"
          fullWidth
          leftIcon={<GoogleIcon />}
          onClick={() => Alert.alert('Belum tersedia', 'Masuk dengan Google belum tersedia.')}
        >
          Masuk dengan Google
        </Button>

        <p className="mt-5 text-center text-sm text-ink-2">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-primary-600 hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.455 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}
