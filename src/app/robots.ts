import type { MetadataRoute } from 'next';

import { LANDING } from '@/config/site';

// Halaman aplikasi (di balik login) tidak perlu diindeks; toko online /toko/* boleh.
export default function robots(): MetadataRoute.Robots {
  const base = LANDING.siteUrl.replace(/\/$/, '');
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/toko/'],
      disallow: ['/api/', '/dashboard', '/pos', '/checkout', '/pesanan', '/storefront', '/settings', '/reset-password'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
