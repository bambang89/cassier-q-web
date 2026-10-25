'use client';

import { useEffect, useState } from 'react';

import { Alert } from '@/lib/alert';
import { fetchStoreProfile, updateStoreProfile } from '@/lib/store/slices/storeProfileSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { Badge } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { FormControl, Input } from '@/components/ui/Field';
import { LoadingBlock } from '@/components/ui/Spinner';
import { StoreIcon } from '@/components/ui/icons/NavIcons';

/** Form profil toko (Outlet) — dipakai halaman Outlet. */
export function StoreProfileForm() {
  const dispatch = useAppDispatch();
  const { profile, status, updateStatus } = useAppSelector((state) => state.storeProfile);
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    dispatch(fetchStoreProfile());
  }, [dispatch]);

  useEffect(() => {
    if (!profile) return;
    setStoreName(profile.storeName ?? '');
    setAddress(profile.address ?? '');
    setProvince(profile.province ?? '');
    setCity(profile.city ?? '');
    setPhone(profile.phone ?? '');
  }, [profile]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName) return;
    try {
      await dispatch(updateStoreProfile({ storeName, address: address || undefined, province: province || undefined, city: city || undefined, phone: phone || undefined })).unwrap();
      Alert.alert('Berhasil', 'Profil toko sudah disimpan.');
    } catch {
      Alert.alert('Gagal', 'Profil toko tidak bisa disimpan, coba lagi.');
    }
  };

  if (status === 'loading' && !profile) return <LoadingBlock label="Memuat profil toko..." />;

  return (
    <form onSubmit={onSave} className="mx-auto grid max-w-[1000px] gap-5 lg:grid-cols-[320px_1fr]">
      {profile ? (
        <div className="h-fit overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="relative flex h-28 items-end bg-[linear-gradient(135deg,#0B1F33_0%,#123E7A_60%,#2563EB_100%)] p-4">
            <span className="absolute -bottom-7 left-5 flex size-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-primary-50 text-primary-600 shadow-md">
              {profile.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.logoUrl} alt="" className="size-full object-cover" />
              ) : (
                <StoreIcon size={26} />
              )}
            </span>
          </div>
          <div className="p-5 pt-10">
            <p className="text-lg font-bold text-ink">{profile.storeName}</p>
            <p className="text-sm font-semibold tracking-wide text-ink-3">{profile.storeCode}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.headOffice ? <Badge variant="primary">Kantor Pusat</Badge> : null}
              <Badge variant={profile.status === 'ACTIVE' ? 'success' : 'neutral'}>{profile.status === 'ACTIVE' ? 'Aktif' : profile.status}</Badge>
            </div>
            <p className="mt-4 text-[12.5px] text-ink-3">Kode toko & status ditetapkan sistem, tidak bisa diubah dari sini.</p>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card tab:p-6">
        <p className="mb-4 text-base font-bold text-ink">Data Toko</p>
        <FormControl label="Nama toko" isRequired>
          <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Nama toko" />
        </FormControl>
        <FormControl label="Alamat">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Opsional" />
        </FormControl>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <FormControl label="Provinsi">
            <Input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Opsional" />
          </FormControl>
          <FormControl label="Kota">
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Opsional" />
          </FormControl>
        </div>
        <FormControl label="Telepon">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Opsional" type="tel" />
        </FormControl>
        <p className="mb-4 text-[12.5px] text-ink-3">Nama, alamat, dan telepon di sini dipakai sebagai kop struk.</p>
        <Button type="submit" loading={updateStatus === 'loading'} disabled={!storeName}>
          Simpan
        </Button>
      </div>
    </form>
  );
}
