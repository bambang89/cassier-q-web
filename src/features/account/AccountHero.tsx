'use client';

import { useState } from 'react';

import * as authApi from '@/api/authApi';
import * as storeApi from '@/api/storeApi';
import { apiErrorMessage } from '@/api/errors';
import { Alert } from '@/lib/alert';
import { photoProblem, pickPhoto } from '@/lib/pickPhoto';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { userUpdated } from '@/store/slices/authSlice';
import { storeProfileUpdated } from '@/store/slices/storeProfileSlice';
import { initialsOf } from '@/navigation/menu';
import { Spinner } from '@/components/ui/Spinner';
import { PencilIcon, StoreIcon } from '@/components/icons/LineIcons';

/** Kartu profil navy: foto profil & foto toko (bisa diganti Kepala Toko), nama, role. */
export function AccountHero() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const storeProfile = useAppSelector((state) => state.storeProfile.profile);
  const storeName = storeProfile?.storeName ?? user?.roles?.[0]?.storeName ?? '-';
  // Foto profil & toko hanya bisa diganti Kepala Toko (API: hasRole KEPALA_TOKO).
  const isKepalaToko = !!user?.roles.some((r) => r.roleCode === 'KEPALA_TOKO');
  const [uploading, setUploading] = useState<'avatar' | 'store' | null>(null);

  const run = async (kind: 'avatar' | 'store', action: () => Promise<void>) => {
    setUploading(kind);
    try {
      await action();
    } catch (error) {
      Alert.alert('Gagal', apiErrorMessage(error, 'Foto tidak bisa disimpan. Pastikan format JPG/PNG/WEBP maks 5MB.'));
    } finally {
      setUploading(null);
    }
  };

  const pickAndUpload = async (kind: 'avatar' | 'store') => {
    const file = await pickPhoto();
    if (!file) return;
    const problem = photoProblem(file);
    if (problem) return Alert.alert('Foto tidak valid', problem);
    run(kind, async () => {
      if (kind === 'avatar') dispatch(userUpdated(await authApi.uploadAvatar(file)));
      else dispatch(storeProfileUpdated(await storeApi.uploadStoreLogo(file)));
    });
  };

  const changePhoto = (kind: 'avatar' | 'store') => {
    const hasPhoto = kind === 'avatar' ? !!user?.avatarUrl : !!storeProfile?.logoUrl;
    if (!hasPhoto) return pickAndUpload(kind);
    Alert.alert(kind === 'avatar' ? 'Foto profil' : 'Foto toko', undefined, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus foto',
        style: 'destructive',
        onPress: () =>
          run(kind, async () => {
            if (kind === 'avatar') dispatch(userUpdated(await authApi.removeAvatar()));
            else dispatch(storeProfileUpdated(await storeApi.removeStoreLogo()));
          }),
      },
      { text: 'Ganti foto', onPress: () => pickAndUpload(kind) },
    ]);
  };

  return (
    <div className="relative space-y-4 overflow-hidden rounded-2xl bg-navy-900 p-5">
      <div className="absolute -top-16 -right-10 size-48 rounded-full bg-primary-600 opacity-35 blur-sm" />
      <div className="relative flex items-center gap-3.5">
        <button
          type="button"
          disabled={!isKepalaToko || uploading !== null}
          onClick={() => changePhoto('avatar')}
          className="relative enabled:cursor-pointer"
          aria-label="Ganti foto profil"
        >
          <span className="flex size-[60px] items-center justify-center overflow-hidden rounded-full border-[3px] border-white/20 bg-primary-600 text-xl font-bold text-white">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              initialsOf(user?.name) || '?'
            )}
            {uploading === 'avatar' ? (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-navy-900/55 text-white">
                <Spinner />
              </span>
            ) : null}
          </span>
          {isKepalaToko ? (
            <span className="absolute -right-0.5 -bottom-0.5 flex size-[22px] items-center justify-center rounded-full border-2 border-navy-900 bg-primary-600 text-white">
              <PencilIcon size={11} />
            </span>
          ) : null}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-white">{user?.name ?? '-'}</p>
          <p className="truncate text-[13px] text-white/65">@{user?.username ?? '-'}</p>
          {user?.email ? <p className="truncate text-[13px] text-white/65">{user.email}</p> : null}
        </div>
      </div>
      <div className="relative flex items-center justify-between gap-2 border-t border-white/10 pt-3.5">
        <button
          type="button"
          disabled={!isKepalaToko || uploading !== null}
          onClick={() => changePhoto('store')}
          className="flex min-w-0 items-center gap-2 text-left enabled:cursor-pointer"
          aria-label="Ganti foto toko"
        >
          <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/12 text-white/80">
            {storeProfile?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={storeProfile.logoUrl} alt="" className="size-full object-cover" />
            ) : (
              <StoreIcon size={16} />
            )}
            {uploading === 'store' ? (
              <span className="absolute inset-0 flex items-center justify-center bg-navy-900/55 text-white">
                <Spinner size={14} />
              </span>
            ) : null}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold text-white/85">{storeName}</span>
            {isKepalaToko ? (
              <span className="block text-[11px] text-white/50">{storeProfile?.logoUrl ? 'Klik untuk ganti foto toko' : 'Klik untuk tambah foto toko'}</span>
            ) : null}
          </span>
        </button>
        <div className="flex flex-wrap justify-end gap-1.5">
          {user?.roles.map((role) => (
            <span key={`${role.roleCode}-${role.storeId ?? 'global'}`} className="rounded-full bg-white/12 px-2 py-0.5 text-[12px] font-semibold text-white">
              {role.roleName}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
