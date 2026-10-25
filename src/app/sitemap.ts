import type { MetadataRoute } from 'next';

import { LANDING } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = LANDING.siteUrl.replace(/\/$/, '');
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/register`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/login`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
