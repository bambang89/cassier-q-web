// Browser memanggil API lewat path relatif (/api/v1) yang di-proxy Next.js ke
// backend (lihat rewrites di next.config.ts) — tidak perlu CORS di backend.
export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1',
};
