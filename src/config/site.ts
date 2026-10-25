/**
 * Semua informasi bisnis yang tampil di landing page ada di sini.
 * Nilai `null` = belum diberikan pemilik bisnis → bagian terkait otomatis
 * disembunyikan atau diganti ajakan menghubungi tim (tidak ada data karangan).
 * Lihat features/landing/README.md untuk daftar yang wajib diisi sebelum rilis.
 */

function clean(value: string | undefined): string | null {
  const v = value?.trim();
  return v ? v : null;
}

export const LANDING = {
  brand: 'cassier-Q',
  /** URL publik situs, mis. https://cassierq.id — dipakai untuk canonical, OG, sitemap. */
  siteUrl: clean(process.env.NEXT_PUBLIC_SITE_URL) ?? 'http://localhost:3000',
  contact: {
    /** Nomor WhatsApp format internasional tanpa "+", mis. 6281234567890. */
    whatsapp: clean(process.env.NEXT_PUBLIC_CONTACT_WHATSAPP),
    email: clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
    /** Alamat kantor (opsional). */
    address: clean(process.env.NEXT_PUBLIC_CONTACT_ADDRESS),
  },
  /** Isi hanya akun yang benar-benar ada. */
  social: [] as { label: string; href: string }[],
  legal: {
    privacy: clean(process.env.NEXT_PUBLIC_PRIVACY_URL),
    terms: clean(process.env.NEXT_PUBLIC_TERMS_URL),
  },
  /** Harga belum ditetapkan → bagian Harga menampilkan "Hubungi Kami". */
  pricing: null as null | { name: string; price: string; period: string; features: string[]; highlight?: boolean }[],
  /** Testimoni hanya yang sudah terverifikasi & diizinkan tampil. */
  testimonials: [] as { quote: string; name: string; business: string; photo?: string }[],
  routes: {
    register: '/register',
    login: '/login',
    dashboard: '/dashboard',
  },
} as const;

export function whatsappLink(message: string): string | null {
  const number = LANDING.contact.whatsapp;
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0';
