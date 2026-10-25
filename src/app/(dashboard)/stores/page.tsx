'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { AdminStore } from '@/types/api';
import { chooseActiveStore, fetchAdminStores } from '@/lib/store/slices/accessSlice';
import { logout } from '@/lib/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/Field';
import { Badge, EmptyState } from '@/components/ui/Display';
import { LoadingBlock } from '@/components/ui/Spinner';
import { StoreIcon } from '@/components/ui/icons/NavIcons';
import { SearchIcon, CheckIcon, ChevronRightIcon, ChevronLeftIcon } from '@/components/ui/icons/ActionIcons';

/**
 * Khusus SUPERADMIN (pemilik aplikasi): pilih toko yang mau dibantu. Semua
 * halaman lalu bekerja atas nama toko itu (header X-Store-Id) sampai diganti.
 */
export default function StorePickerPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { stores, storesStatus, activeStore } = useAppSelector((state) => state.access);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchAdminStores());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter((s) => [s.storeName, s.storeCode, s.city ?? '', s.address ?? ''].some((v) => v.toLowerCase().includes(q)));
  }, [stores, query]);

  const choose = async (store: AdminStore) => {
    await dispatch(chooseActiveStore({ id: store.id, name: store.storeName }));
    router.replace('/dashboard');
  };

  return (
    <div className="min-h-dvh bg-canvas">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0B1F33_0%,#123E7A_60%,#2563EB_100%)] px-5 pt-8 pb-16">
        <div className="absolute -right-24 -bottom-32 size-80 rounded-full bg-[rgba(96,165,250,0.18)]" />
        <div className="relative mx-auto max-w-[760px] animate-fade-in">
          {activeStore ? (
            <button type="button" onClick={() => router.back()} className="mb-5 flex cursor-pointer items-center gap-1 text-sm font-semibold text-white/80 hover:text-white">
              <ChevronLeftIcon size={16} /> Kembali
            </button>
          ) : null}
          <p className="text-[12.5px] font-bold tracking-[2px] text-[#8FE0C2]">PEMILIK APLIKASI</p>
          <h1 className="mt-1 text-[26px] font-bold text-white">Pilih toko yang ingin dibantu</h1>
          <p className="mt-1 text-sm text-white/75">
            {`Halo, ${user?.name?.split(' ')[0] ?? 'Admin'}. Anda bisa melihat dan mengelola seluruh data toko yang dipilih.`}
          </p>
        </div>
      </div>

      <div className="relative mx-auto -mt-8 max-w-[760px] px-5 pb-10">
        <Input placeholder="Cari nama toko, kode, atau kota" value={query} onChange={(e) => setQuery(e.target.value)} leftElement={<SearchIcon size={16} className="text-ink-3" />} />
        <div className="mt-4 space-y-2.5">
          {filtered.length === 0 ? (
            storesStatus === 'loading' ? (
              <LoadingBlock />
            ) : (
              <EmptyState
                icon={StoreIcon}
                title={query ? 'Toko tidak ditemukan' : 'Belum ada toko'}
                description={query ? 'Coba kata kunci lain.' : 'Toko baru muncul di sini setelah Kepala Toko mendaftar lewat aplikasi.'}
              />
            )
          ) : (
            filtered.map((item, index) => {
              const selected = activeStore?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => choose(item)}
                  style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
                  className={cn(
                    'flex w-full animate-fade-in cursor-pointer items-center gap-3 rounded-xl border bg-white p-4 text-left shadow-card transition hover:border-primary-300',
                    selected ? 'border-primary-600 ring-2 ring-primary-100' : 'border-line',
                  )}
                >
                  <span className={cn('flex size-11 items-center justify-center rounded-lg', selected ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600')}>
                    <StoreIcon size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-ink">{item.storeName}</span>
                    <span className="block truncate text-[12.5px] text-ink-3">{[item.storeCode, item.city ?? item.address].filter(Boolean).join(' · ')}</span>
                  </span>
                  {item.status !== 'ACTIVE' ? <Badge variant="warning">{item.status}</Badge> : null}
                  {selected ? (
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary-600 text-white">
                      <CheckIcon size={14} strokeWidth={2.4} />
                    </span>
                  ) : (
                    <ChevronRightIcon size={18} className="text-gray-400" />
                  )}
                </button>
              );
            })
          )}
        </div>
        {!activeStore ? (
          <p className="mt-6 text-center">
            <button type="button" onClick={() => dispatch(logout())} className="cursor-pointer font-semibold text-primary-600 hover:underline">
              Keluar dari akun
            </button>
          </p>
        ) : null}
      </div>
    </div>
  );
}
