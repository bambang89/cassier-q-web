'use client';

import { useParams } from 'next/navigation';

import { PublicStorePage } from '@/features/storefront/components/PublicStorePage';

/** Link per meja: /toko/<slug>/<kode-meja> — pesanan otomatis "Makan di tempat" di meja itu. */
export default function TableStorePage() {
  const { meja } = useParams<{ meja: string }>();
  return <PublicStorePage tableCode={decodeURIComponent(meja)} />;
}
