# Landing page cassier-Q (company profile)

Halaman publik di `/` (sebelumnya `/` langsung redirect ke `/dashboard`).
Pengguna yang sudah login melihat tombol **Buka Dashboard** di navbar.

## Struktur

| File | Isi |
| --- | --- |
| `app/page.tsx` | Metadata SEO, Open Graph, canonical, JSON-LD `SoftwareApplication` |
| `app/sitemap.ts`, `app/robots.ts` | `/sitemap.xml`, `/robots.txt` (halaman aplikasi di-disallow) |
| `config.ts` | **Semua data bisnis** (kontak, harga, testimoni, sosial, legal) — `null`/kosong = disembunyikan |
| `content.ts` | Copy: masalah/solusi, fitur, solusi per bisnis, langkah, FAQ |
| `LandingPage.tsx` | Seluruh seksi (server component) |
| `LandingNav.tsx` | Navbar sticky + menu mobile (Esc menutup) |
| `ProductDemo.tsx` | Tab demo (panah kiri/kanan untuk keyboard) |
| `mockups.tsx` | Mockup HTML/CSS tampilan aplikasi — berlabel "Ilustrasi · data contoh" |
| `LeadForm.tsx` | Form konsultasi: validasi, honeypot, lalu membuka WhatsApp/email tim |
| `track.ts` | Event konversi → `window.dataLayer` + `CustomEvent('cq:track')` |
| `ui.tsx`, `icons.tsx` | Tombol/link ber-tracking, ikon tambahan |

Warna landing: token `electric-*` (#3d7bff), `pine-*` (hijau tua logo #0e7a5b), `night` di `app/globals.css`.

## Menjalankan

```bash
npm run dev        # http://localhost:3000
npm run build && npm start
```

Variabel `NEXT_PUBLIC_*` (lihat `.env.example`) dibaca saat **build**. Untuk image Docker,
tambahkan sebagai `ARG`/`ENV` di Dockerfile atau sediakan `.env.production` sebelum `next build`.

## Event konversi

`cta_primary_click`, `cta_secondary_click`, `registration_start`, `whatsapp_click`,
`demo_request`, `contact_submit`. Pasang GTM/GA4 (tanpa ID karangan) lalu dengarkan `dataLayer`.

## Checklist sebelum rilis (wajib dari pemilik bisnis)

- [ ] Domain final → `NEXT_PUBLIC_SITE_URL` (canonical, OG, sitemap)
- [ ] Nomor WhatsApp tim → `NEXT_PUBLIC_CONTACT_WHATSAPP` (tanpa ini form konsultasi tidak bisa terkirim)
- [ ] Email & alamat kantor → `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_ADDRESS`
- [ ] Halaman Kebijakan Privasi & Syarat Ketentuan → `NEXT_PUBLIC_PRIVACY_URL`, `NEXT_PUBLIC_TERMS_URL`
- [ ] Harga paket (atau tetap "Hubungi Kami") → `LANDING.pricing`
- [ ] Ketentuan uji coba gratis → jawaban FAQ di `content.ts`
- [ ] Ketersediaan aplikasi mobile di Play Store / App Store (link unduh)
- [ ] Testimoni terverifikasi + izin publikasi → `LANDING.testimonials`
- [ ] Logo pelanggan / jumlah pengguna (hanya yang terverifikasi)
- [ ] Akun media sosial resmi → `LANDING.social`
- [ ] Profil perusahaan (badan usaha, tahun berdiri) untuk seksi Tentang Kami
- [ ] Gambar Open Graph 1200×630 (`app/opengraph-image.png`)
- [ ] Screenshot asli aplikasi (opsional, menggantikan mockup ilustrasi)
- [ ] ID analitik (GTM/GA4) bila ingin melacak konversi
