'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyMenus, restoreActiveStore } from '@/store/slices/accessSlice';
import { FullScreenLoader, useAuthBootstrap } from './AuthBootstrap';
import { PhoneTabBar } from './PhoneTabBar';
import { Sidebar } from './Sidebar';

/**
 * Kerangka semua halaman setelah login: sidebar (layar lebar) atau bottom tab
 * bar (HP). Juga gerbang login & pemilihan toko SUPERADMIN, seperti
 * RootNavigator di aplikasi mobile.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const status = useAuthBootstrap();
  const isSuperadmin = useAppSelector((state) => !!state.auth.user?.superadmin);
  const { activeStore, activeStoreLoaded } = useAppSelector((state) => state.access);
  const isAuthenticated = status === 'authenticated';
  // SUPERADMIN tidak terikat toko: wajib memilih toko dulu.
  const needsStore = isAuthenticated && isSuperadmin && activeStoreLoaded && !activeStore;
  const onStorePicker = pathname === '/stores';

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (isAuthenticated && isSuperadmin) dispatch(restoreActiveStore());
  }, [dispatch, isAuthenticated, isSuperadmin]);

  useEffect(() => {
    if (needsStore && !onStorePicker) router.replace('/stores');
  }, [needsStore, onStorePicker, router]);

  // Menu yang diizinkan Kepala Toko — dimuat ulang tiap login & tiap ganti toko.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (isSuperadmin && !activeStore) return;
    dispatch(fetchMyMenus());
  }, [dispatch, isAuthenticated, isSuperadmin, activeStore]);

  if (!isAuthenticated || (isSuperadmin && !activeStoreLoaded) || (needsStore && !onStorePicker)) {
    return <FullScreenLoader />;
  }

  if (onStorePicker) return <>{children}</>;

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <Sidebar />
      {/* key: ganti toko (SUPERADMIN) memasang ulang halaman → data termuat ulang. */}
      <main key={activeStore?.id ?? 'own-store'} className="flex min-w-0 flex-1 flex-col pb-[76px] tab:pb-0">
        {children}
      </main>
      <PhoneTabBar />
    </div>
  );
}
