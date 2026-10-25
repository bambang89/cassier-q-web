# cassier-Q Web

Versi web aplikasi kasir **cassier-Q** — duplikat tampilan dan alur aplikasi
mobile [`cassier-Q-rn`](../../Mobile/cassier-Q-rn), memakai backend yang sama
([`cassier-q-api`](../cassier-q-api)).

- Layar lebar (≥ 740px): kerangka tablet — sidebar navy, top bar, split view.
- HP: kerangka mobile — bottom tab bar (Kasir di tengah) + halaman Menu.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 — token warna/radius/bayangan di `src/app/globals.css`, disalin dari `cassier-Q-rn/src/theme` |
| Font | Plus Jakarta Sans (`next/font/google`) |
| State & API | Redux Toolkit + axios — `src/api`, `src/store`, `src/types`, `src/utils` disalin dari aplikasi mobile |

## Menjalankan

```bash
cp .env.example .env.local   # atur CASSIERQ_API_ORIGIN
npm install
npm run dev                  # http://localhost:3000
```

| Variabel | Fungsi |
|---|---|
| `CASSIERQ_API_ORIGIN` | Origin backend cassier-q-api (server-side). Lokal `http://localhost:8080`, production `https://api.43-134-16-30.sslip.io` |
| `NEXT_PUBLIC_API_BASE_URL` | Opsional. Default `/api/v1` (lewat proxy) |
| `NEXT_PUBLIC_APP_VERSION` | Opsional, ditampilkan di halaman Akun |

Browser hanya bicara ke origin Next.js: `/api/v1/*` dan `/uploads/*` di-proxy
ke backend lewat `rewrites` di `next.config.ts`, jadi backend **tidak perlu
CORS**. URL foto dari backend diubah jadi path relatif `/uploads/...` oleh
interceptor di `src/api/client.ts`.

Login dikirim dengan `X-Device-Type: WEB` dan device id acak yang disimpan di
`localStorage` (token juga di `localStorage`).

## Struktur

```
src/
  app/(auth)/          login, register, lupa & reset kata sandi
  app/(app)/           semua halaman setelah login (AppShell: gerbang login, sidebar, tab bar)
  components/ui/       Button, Field, Modal, AlertDialog, Display (Badge, Card, KpiCard, ...)
  components/layout/   Sidebar, PhoneTabBar, PageHeader, SplitView, AppShell, AuthShell
  features/<area>/     komponen per fitur (pos, orders, products, inventory, customers, settings, ...)
  navigation/menu.ts   katalog menu + hak akses (padanan menuCatalog.ts mobile)
  lib/alert.ts         Alert.alert() ala React Native, dirender oleh <AlertHost />
  api/ store/ types/ utils/ hooks/   disalin dari cassier-Q-rn (SecureStore → localStorage)
```

## Perbedaan dengan aplikasi mobile

- **Printer**: tidak ada pemasangan Bluetooth — struk dicetak lewat dialog cetak
  browser (`window.print`, ukuran kertas 58/80mm). Lihat menu Printer Struk.
- **Scan barcode**: kamera via `BarcodeDetector` (Chrome/Edge/Android); selain itu
  ketik manual atau pakai scanner USB di kolom cari Kasir (Enter = masuk keranjang).
- **Geser kiri (swipe)** di daftar produk diganti menu aksi ⋯.
- **Notifikasi push** dan **pemilih environment API** tidak ada di web.
- Shortcut Kasir: `F2` cari produk, `F7` diskon, `F9` bayar.
