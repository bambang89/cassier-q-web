'use client';

import { useRef } from 'react';

import type { StorefrontPageSettings, StorefrontLayout } from '@/types/storefront';
import { Alert } from '@/lib/alert';
import { cn } from '@/utils/cn';
import { Input, TextArea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { FULFILLMENT_LABELS } from '@/features/storefront/constants';
import { Row, Section, Toggle } from '@/features/storefront/components/panels/primitives';
import { TablesEditor } from '@/features/storefront/components/panels/TablesEditor';
import { Segmented } from '@/features/storefront/components/inspector/fields';

export function PagePanel({
  slug,
  host,
  published,
  page,
  storeName,
  focus,
  onSlug,
  onPublished,
  onPage,
  onExport,
  onImport,
}: {
  slug: string;
  host: string;
  published: boolean;
  page: StorefrontPageSettings;
  storeName: string;
  focus: 'header' | 'footer' | null;
  onSlug: (slug: string) => void;
  onPublished: (v: boolean) => void;
  onPage: (patch: Partial<StorefrontPageSettings>, key?: string) => void;
  onExport: () => void;
  onImport: (layout: StorefrontLayout) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const url = `${host}/toko/${slug}`;
  const fullUrl = typeof window === 'undefined' ? url : `${window.location.protocol}//${url}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      Alert.alert('Disalin', 'Link toko sudah disalin.');
    } catch {
      Alert.alert('Link toko', fullUrl);
    }
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as StorefrontLayout;
      if (!parsed || !Array.isArray(parsed.blocks)) throw new Error('format');
      Alert.alert('Ganti desain?', 'Desain sekarang akan diganti dengan isi file. Masih bisa dibatalkan dengan Undo.', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ganti', style: 'destructive', onPress: () => onImport(parsed) },
      ]);
    } catch {
      Alert.alert('File tidak valid', 'Pilih file .json hasil "Unduh cadangan" dari editor ini.');
    }
  };

  return (
    <div className="space-y-5">
      <Section title="Alamat & status">
        <Row label="Alamat toko">
          <div className="flex items-center rounded-md border border-line bg-gray-50 text-sm focus-within:border-primary-500 focus-within:bg-white">
            <span className="max-w-[45%] truncate pl-3 text-ink-3">{host}/toko/</span>
            <input value={slug} onChange={(e) => onSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60))} className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 font-semibold text-ink outline-none" aria-label="Alamat toko" />
          </div>
        </Row>
        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" variant="outline" onClick={copy}>
            Salin
          </Button>
          <a href={`/toko/${slug}`} target="_blank" rel="noreferrer" className="flex min-h-10 items-center justify-center rounded-md border border-line text-sm font-semibold text-ink-2 hover:bg-gray-50">
            Buka ↗
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Yuk pesan online di ${storeName}: ${fullUrl}`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-10 items-center justify-center rounded-md bg-[#25D366] text-sm font-semibold text-white"
          >
            Bagikan
          </a>
        </div>
        <Toggle label="Terbitkan toko" hint={published ? 'Pembeli bisa membuka toko' : 'Hanya Anda yang bisa melihat'} value={published} onChange={onPublished} />
      </Section>

      <div className={cn('rounded-xl transition', focus === 'header' && 'bg-primary-50/60 p-3 ring-2 ring-primary-200')}>
        <Section title="Header (kepala halaman)">
          <Toggle label="Tampilkan header" value={page.headerShow} onChange={(v) => onPage({ headerShow: v })} />
          <Row label="Gaya header">
            <Segmented value={page.headerStyle} onChange={(v) => onPage({ headerStyle: v as StorefrontPageSettings['headerStyle'] })} options={[{ value: 'light', label: 'Terang' }, { value: 'theme', label: 'Warna tema' }, { value: 'transparent', label: 'Transparan' }]} />
          </Row>
          <Toggle label="Menempel saat di-scroll" value={page.headerSticky} onChange={(v) => onPage({ headerSticky: v })} />
          <Toggle label="Tampilkan logo" hint="Logo diambil dari Profil Toko" value={page.headerShowLogo} onChange={(v) => onPage({ headerShowLogo: v })} />
          <Row label="Slogan (kosong = nama kota)">
            <Input value={page.headerTagline} onChange={(e) => onPage({ headerTagline: e.target.value.slice(0, 80) }, 'page:tagline')} placeholder="mis. Kopi enak, harga teman" />
          </Row>
        </Section>
      </div>

      <div className={cn('rounded-xl transition', focus === 'footer' && 'bg-primary-50/60 p-3 ring-2 ring-primary-200')}>
        <Section title="Footer (kaki halaman)">
          <Toggle label="Tampilkan footer" value={page.footerShow} onChange={(v) => onPage({ footerShow: v })} />
          <Row label="Teks footer">
            <TextArea value={page.footerText} onChange={(e) => onPage({ footerText: e.target.value.slice(0, 400) }, 'page:footer')} rows={3} placeholder="mis. Terima kasih sudah berbelanja!" />
          </Row>
          <Toggle label='Tulisan "Dibuat dengan cassier-Q"' value={page.footerPoweredBy} onChange={(v) => onPage({ footerPoweredBy: v })} />
        </Section>
      </div>

      <Section title="Pemesanan online" hint="Pesanan masuk ke menu Pesanan di kasir.">
        <Toggle label="Terima pesanan online" hint={page.orderingEnabled ? 'Pembeli bisa memesan' : 'Mode katalog: tanpa keranjang'} value={page.orderingEnabled} onChange={(v) => onPage({ orderingEnabled: v })} />
        {page.orderingEnabled ? (
          <>
            <Row label="Cara pengambilan yang tersedia">
              <div className="space-y-1.5">
                {FULFILLMENT_LABELS.map((f) => {
                  const on = page.fulfillments.includes(f.value);
                  return (
                    <label key={f.value} className="flex cursor-pointer items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => {
                          const next = on ? page.fulfillments.filter((x) => x !== f.value) : [...page.fulfillments, f.value];
                          if (next.length === 0) return Alert.alert('Minimal satu', 'Pilih minimal satu cara pengambilan.');
                          onPage({ fulfillments: FULFILLMENT_LABELS.map((x) => x.value).filter((x) => next.includes(x)) });
                        }}
                        className="size-4 accent-primary-600"
                      />
                      {f.label}
                    </label>
                  );
                })}
              </div>
            </Row>
            <Row label="Minimal belanja (Rp, 0 = tanpa minimal)">
              <Input value={String(page.minOrder || 0)} onChange={(e) => onPage({ minOrder: Number(e.target.value.replace(/\D/g, '')) || 0 }, 'page:min')} inputMode="numeric" />
            </Row>
            <Row label="Catatan di halaman checkout">
              <Input value={page.checkoutNote} onChange={(e) => onPage({ checkoutNote: e.target.value.slice(0, 200) }, 'page:checkout')} />
            </Row>
          </>
        ) : (
          <Row label="Pesan untuk pembeli">
            <TextArea value={page.closedMessage} onChange={(e) => onPage({ closedMessage: e.target.value.slice(0, 200) }, 'page:closed')} rows={2} />
          </Row>
        )}
      </Section>

      <Section title="Nomor meja (opsional)" hint="Tiap meja punya link /toko/<alamat>/<no-meja yang di-encode> — cetak jadi QR di meja; pembeli yang membukanya langsung memesan untuk meja itu. Bila daftar diisi, hanya meja terdaftar yang diterima.">
        <TablesEditor tables={page.tables} baseUrl={`${typeof window === 'undefined' ? '' : `${window.location.protocol}//`}${host}/toko/${slug}`} onChange={(tables) => onPage({ tables })} />
      </Section>

      <Section title="Tombol WhatsApp mengambang" hint='Muncul di pojok kanan bawah. Juga dipakai tautan "wa:" pada tombol.'>
        <Input value={page.floatingWhatsapp} onChange={(e) => onPage({ floatingWhatsapp: e.target.value.replace(/[^\d+]/g, '').slice(0, 20) }, 'page:wa')} placeholder="mis. 081234567890 (kosong = tidak tampil)" inputMode="tel" />
      </Section>

      <Section title="SEO & berbagi" hint="Tampil di hasil Google dan saat link dibagikan.">
        <Row label="Judul halaman">
          <Input value={page.seoTitle} onChange={(e) => onPage({ seoTitle: e.target.value.slice(0, 70) }, 'page:seot')} placeholder={storeName} />
        </Row>
        <Row label="Deskripsi">
          <TextArea value={page.seoDescription} onChange={(e) => onPage({ seoDescription: e.target.value.slice(0, 160) }, 'page:seod')} rows={3} placeholder="Ringkasan singkat toko Anda" />
        </Row>
        <div className="rounded-lg border border-line bg-white p-3">
          <p className="truncate text-[12px] text-success-700">{url}</p>
          <p className="truncate text-[15px] font-medium text-[#1a0dab]">{page.seoTitle || storeName}</p>
          <p className="line-clamp-2 text-[12.5px] text-ink-2">{page.seoDescription || 'Pesan online, ambil tanpa antre.'}</p>
        </div>
      </Section>

      <Section title="Cadangan desain">
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" onClick={onExport}>
            Unduh cadangan
          </Button>
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
            Pulihkan dari file
          </Button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => (importFile(e.target.files?.[0]), (e.target.value = ''))} />
      </Section>
    </div>
  );
}
