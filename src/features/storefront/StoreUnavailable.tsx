'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { fetchStorefrontSettings, saveStorefront } from '@/api/storefrontApi';
import { apiErrorMessage } from '@/api/errors';
import { loadTokens } from '@/api/tokenStorage';
import type { StorefrontSettings } from '@/types/storefront';
import { defaultLayout } from '@/lib/storefront/blocks';
import { Button } from '@/components/ui/Button';
import { LoadingBlock } from '@/components/ui/Spinner';
import { StoreIcon } from '@/components/icons/LineIcons';

/**
 * Tampil bila /toko/<slug> tidak ditemukan. Pembeli melihat pesan biasa; pemilik toko
 * yang sedang login melihat penyebabnya (belum disimpan / belum terbit / alamat beda)
 * dan bisa langsung menerbitkan tokonya dari sini.
 */
export function StoreUnavailable({ slug, onPublished }: { slug: string; onPublished: () => void }) {
  const [owner, setOwner] = useState<StorefrontSettings | null>(null);
  const [checking, setChecking] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadTokens()
      .then((tokens) => (tokens ? fetchStorefrontSettings() : null))
      .then((settings) => !cancelled && setOwner(settings))
      .catch(() => undefined)
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, []);

  /** Simpan + terbitkan di alamat yang sedang dibuka (desain yang ada, atau desain awal). */
  const publishHere = async () => {
    if (!owner) return;
    setPublishing(true);
    setError(null);
    try {
      await saveStorefront({
        slug,
        published: true,
        themeColor: owner.themeColor ?? '#2563EB',
        layout: owner.layout ?? defaultLayout(owner.storeName),
      });
      onPublished();
    } catch (e) {
      setError(apiErrorMessage(e, 'Toko gagal diterbitkan.'));
      setPublishing(false);
    }
  };

  if (checking) return <LoadingBlock label="Membuka toko…" />;

  const sameSlug = owner?.slug === slug;
  let title = 'Toko tidak ditemukan';
  let message = 'Alamat toko salah, atau toko belum diterbitkan oleh pemiliknya.';
  if (owner && sameSlug && !owner.saved) {
    title = 'Toko online Anda belum pernah disimpan';
    message = `Alamat /toko/${slug} baru usulan dari editor. Terbitkan sekarang supaya pembeli bisa membukanya.`;
  } else if (owner && sameSlug && !owner.published) {
    title = 'Toko online Anda masih Draf';
    message = 'Desain sudah tersimpan, tapi belum diterbitkan. Pembeli masih melihat "Toko tidak ditemukan".';
  } else if (owner && !sameSlug) {
    title = `Alamat /toko/${slug} bukan milik toko Anda`;
    message = owner.saved
      ? `Toko online ${owner.storeName} memakai alamat /toko/${owner.slug}${owner.published ? '' : ' (masih Draf)'}. Anda bisa memindahkannya ke alamat ini.`
      : `Toko online ${owner.storeName} belum pernah disimpan. Anda bisa langsung menerbitkannya di alamat ini.`;
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-canvas p-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-white text-ink-3 shadow-card">
        <StoreIcon size={28} />
      </span>
      <h1 className="max-w-md text-xl font-bold text-ink">{title}</h1>
      <p className="max-w-sm text-ink-2">{message}</p>
      {owner ? (
        <div className="mt-3 flex w-full max-w-sm flex-col gap-2">
          <Button onClick={publishHere} loading={publishing}>
            {sameSlug ? 'Terbitkan sekarang' : `Terbitkan di /toko/${slug}`}
          </Button>
          {!sameSlug && owner.saved && owner.published ? (
            <Link href={`/toko/${owner.slug}`} className="flex min-h-12 items-center justify-center rounded-md border border-line bg-white font-semibold text-ink-2">
              Buka /toko/{owner.slug}
            </Link>
          ) : null}
          <Link href="/storefront" className="py-2 text-sm font-semibold text-primary-700">
            Atur desain dulu di editor →
          </Link>
          {error ? <p className="rounded-lg bg-error-50 p-3 text-sm text-error-600">{error}</p> : null}
          <p className="text-[12px] text-ink-3">Pesan ini hanya terlihat oleh Anda karena sedang login sebagai pemilik toko.</p>
        </div>
      ) : null}
    </div>
  );
}
