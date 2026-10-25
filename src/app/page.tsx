import type { Metadata } from 'next';

import { LANDING } from '@/config/site';
import { LandingPage } from '@/features/landing/components/LandingPage';

const title = 'cassier-Q — Aplikasi Kasir & POS untuk UMKM, Toko, dan Kafe';
const description =
  'Aplikasi kasir online cassier-Q: transaksi kasir, manajemen stok, laporan penjualan, karyawan, dan toko online dalam satu sistem POS untuk usaha di Indonesia.';

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  metadataBase: new URL(LANDING.siteUrl),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'cassier-Q',
    title,
    description,
  },
  twitter: { card: 'summary_large_image', title, description },
};

// Data terstruktur hanya berisi fakta produk — tanpa harga, rating, atau ulasan.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'cassier-Q',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  inLanguage: 'id-ID',
  url: LANDING.siteUrl,
  description,
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingPage />
    </>
  );
}
