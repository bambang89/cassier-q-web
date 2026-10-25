'use client';

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';

import type { Fulfillment, FontKey, StorefrontLayout, StorefrontPageSettings, StorefrontTable, StorefrontTheme } from '@/types/storefront';
import { Alert } from '@/lib/alert';
import { cn } from '@/lib/cn';
import { FONTS, THEME_PRESETS, THEME_STYLES, encodeTable, newTable } from '@/lib/storefront/blocks';
import { TEMPLATES } from '@/lib/storefront/templates';
import type { StorefrontTemplate } from '@/lib/storefront/templates';
import { Input, Select, Switch, TextArea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ColorInput, Segmented, SortableRow, useListSensors } from './BlockInspector';

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="border-b border-line pb-5 last:border-0">
      <h3 className="text-[13px] font-bold tracking-wide text-ink">{title}</h3>
      {hint ? <p className="mt-0.5 text-[12px] text-ink-3">{hint}</p> : null}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-[13px] font-semibold text-ink-2">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint ? <span className="block text-[12px] text-ink-3">{hint}</span> : null}
      </span>
      <Switch value={value} onChange={onChange} label={label} />
    </div>
  );
}

// ── Tema ─────────────────────────────────────────────────────────────

const FONT_OPTIONS = (Object.keys(FONTS) as FontKey[]).map((key) => ({ value: key, label: FONTS[key].label }));

export function ThemePanel({
  themeColor,
  theme,
  onColor,
  onTheme,
  onStyle,
}: {
  themeColor: string;
  theme: StorefrontTheme;
  onColor: (c: string) => void;
  onTheme: (patch: Partial<StorefrontTheme>, key?: string) => void;
  onStyle: (color: string, theme: Partial<StorefrontTheme>) => void;
}) {
  return (
    <div className="space-y-5">
      <Section title="Gaya siap pakai" hint="Satu klik: warna, font, dan bentuk sekaligus.">
        <div className="grid grid-cols-2 gap-2">
          {THEME_STYLES.map((s) => {
            const t = { ...theme, ...s.theme };
            const active = themeColor.toUpperCase() === s.color.toUpperCase() && theme.font === t.font && theme.background === t.background;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onStyle(s.color, s.theme)}
                className={cn('cursor-pointer overflow-hidden rounded-xl border text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-card', active ? 'border-primary-500 ring-2 ring-primary-200' : 'border-line')}
              >
                <div className="flex h-14 items-end gap-1.5 p-2" style={{ background: t.background }}>
                  <span className="h-7 flex-1 rounded-md" style={{ background: s.color, borderRadius: t.radius === 'none' ? 0 : 8 }} />
                  <span className="h-10 flex-1 rounded-md border border-black/5" style={{ background: t.surface, borderRadius: t.radius === 'none' ? 0 : 8 }} />
                </div>
                <p className="px-2 py-1.5 text-[12.5px] font-bold text-ink">{s.label}</p>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Warna">
        <Row label="Warna utama (tombol, harga, aksen)">
          <ColorInput value={themeColor} onChange={onColor} presets={THEME_PRESETS} />
        </Row>
        <Row label="Latar halaman">
          <ColorInput value={theme.background} onChange={(v) => onTheme({ background: v }, 'theme:bg')} presets={['#F7F8FB', '#FFFFFF', '#FBF7F2', '#F3FBF7', '#FFF5FA', '#0F1115']} />
        </Row>
        <Row label="Latar kartu">
          <ColorInput value={theme.surface} onChange={(v) => onTheme({ surface: v }, 'theme:surface')} presets={['#FFFFFF', '#F8FAFC', '#1A1D24', '#111827']} />
        </Row>
        <Row label="Warna teks">
          <ColorInput value={theme.text} onChange={(v) => onTheme({ text: v }, 'theme:text')} presets={['#0F172A', '#3B2A1F', '#111827', '#F3F4F6']} />
        </Row>
      </Section>

      <Section title="Huruf">
        <Row label="Font isi">
          <Select value={theme.font} onChange={(v) => onTheme({ font: v as FontKey })} options={FONT_OPTIONS} />
        </Row>
        <Row label="Font judul">
          <Select value={theme.headingFont} onChange={(v) => onTheme({ headingFont: v as FontKey })} options={FONT_OPTIONS} />
        </Row>
        <div className="rounded-lg border border-line bg-white p-3">
          <p className="text-xl font-bold" style={{ fontFamily: FONTS[theme.headingFont].css }}>
            Judul Toko Anda
          </p>
          <p className="text-sm text-ink-2" style={{ fontFamily: FONTS[theme.font].css }}>
            Contoh teks isi, harga Rp25.000.
          </p>
        </div>
        <Row label="Ukuran judul">
          <Segmented value={theme.headingSize} onChange={(v) => onTheme({ headingSize: v as StorefrontTheme['headingSize'] })} options={[{ value: 'sm', label: 'Kecil' }, { value: 'md', label: 'Sedang' }, { value: 'lg', label: 'Besar' }]} />
        </Row>
      </Section>

      <Section title="Bentuk">
        <Row label="Sudut kartu & gambar">
          <Segmented
            value={theme.radius}
            onChange={(v) => onTheme({ radius: v as StorefrontTheme['radius'] })}
            options={[
              { value: 'none', label: '▢' },
              { value: 'sm', label: 'S' },
              { value: 'md', label: 'M' },
              { value: 'lg', label: 'L' },
              { value: 'xl', label: 'XL' },
            ]}
          />
        </Row>
        <Row label="Bentuk tombol">
          <Segmented value={theme.buttonShape} onChange={(v) => onTheme({ buttonShape: v as StorefrontTheme['buttonShape'] })} options={[{ value: 'square', label: 'Kotak' }, { value: 'rounded', label: 'Membulat' }, { value: 'pill', label: 'Kapsul' }]} />
        </Row>
        <Row label="Gaya kartu">
          <Segmented value={theme.cardStyle} onChange={(v) => onTheme({ cardStyle: v as StorefrontTheme['cardStyle'] })} options={[{ value: 'shadow', label: 'Bayangan' }, { value: 'border', label: 'Garis' }, { value: 'flat', label: 'Datar' }]} />
        </Row>
        <Row label="Kartu produk">
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ['classic', 'Klasik'],
                ['minimal', 'Minimal'],
                ['overlay', 'Foto penuh'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onTheme({ productCard: key })}
                className={cn('cursor-pointer rounded-lg border p-2 text-center transition', theme.productCard === key ? 'border-primary-500 bg-primary-50' : 'border-line hover:border-gray-300')}
              >
                <ProductCardThumb kind={key} color={themeColor} />
                <span className="mt-1 block text-[11.5px] font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </Row>
      </Section>
    </div>
  );
}

function ProductCardThumb({ kind, color }: { kind: StorefrontTheme['productCard']; color: string }) {
  if (kind === 'overlay')
    return (
      <div className="relative mx-auto h-14 w-11 overflow-hidden rounded bg-gradient-to-b from-amber-200 to-amber-500">
        <span className="absolute inset-x-1 bottom-1 h-1.5 rounded bg-white/90" />
      </div>
    );
  if (kind === 'minimal')
    return (
      <div className="mx-auto w-11">
        <div className="h-9 rounded bg-amber-200" />
        <span className="mt-1 block h-1.5 w-8 rounded bg-gray-300" />
        <span className="mt-0.5 block h-1.5 w-5 rounded bg-gray-500" />
      </div>
    );
  return (
    <div className="mx-auto w-11 overflow-hidden rounded border border-gray-200 bg-white">
      <div className="h-8 bg-amber-200" />
      <div className="flex items-center justify-between p-1">
        <span className="h-1.5 w-5 rounded" style={{ background: color }} />
        <span className="size-2.5 rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}

// ── Halaman ──────────────────────────────────────────────────────────

const FULFILLMENT_LABELS: { value: Fulfillment; label: string }[] = [
  { value: 'PICKUP', label: 'Ambil di toko' },
  { value: 'DELIVERY', label: 'Diantar' },
  { value: 'DINE_IN', label: 'Makan di tempat' },
];

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

// ── Template ─────────────────────────────────────────────────────────

export function TemplatesPanel({ onApply }: { onApply: (template: StorefrontTemplate) => void }) {
  return (
    <div>
      <p className="mb-3 text-[12.5px] text-ink-3">Mulai cepat dari desain jadi sesuai jenis usaha. Desain sekarang akan diganti (bisa di-Undo).</p>
      <div className="space-y-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() =>
              Alert.alert(`Pakai template ${t.label}?`, 'Susunan blok dan tema sekarang akan diganti. Alamat toko dan status terbit tidak berubah.', [
                { text: 'Batal', style: 'cancel' },
                { text: 'Pakai', onPress: () => onApply(t) },
              ])
            }
            className="group flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-line bg-white p-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg text-2xl transition duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]" style={{ background: `color-mix(in srgb, ${t.color} 16%, white)` }}>
              {t.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-ink">{t.label}</span>
              <span className="line-clamp-2 block text-[12px] leading-snug text-ink-3">{t.description}</span>
            </span>
            <span className="size-3 shrink-0 rounded-full" style={{ background: t.color }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Meja ─────────────────────────────────────────────────────────────

const MAX_TABLES = 200;

function TablesEditor({ tables, baseUrl, onChange }: { tables: StorefrontTable[]; baseUrl: string; onChange: (tables: StorefrontTable[]) => void }) {
  const [label, setLabel] = useState('');
  const [prefix, setPrefix] = useState('Meja');
  const [count, setCount] = useState('10');
  const sensors = useListSensors();
  const linkOf = (t: StorefrontTable) => `${baseUrl}/${encodeTable(t.label)}`;
  const isDuplicate = (t: StorefrontTable) => tables.some((x) => x.id !== t.id && x.label.trim().toLowerCase() === t.label.trim().toLowerCase());

  const addOne = () => {
    const value = label.trim();
    if (!value) return;
    if (tables.some((t) => t.label.toLowerCase() === value.toLowerCase())) return Alert.alert('Sudah ada', `Meja "${value}" sudah ada di daftar.`);
    onChange([...tables, newTable(value.slice(0, 40))]);
    setLabel('');
  };

  const addMany = () => {
    const n = Math.min(Number(count) || 0, MAX_TABLES - tables.length);
    if (n <= 0) return;
    const existing = new Set(tables.map((t) => t.label.toLowerCase()));
    const added: StorefrontTable[] = [];
    // Nomor yang namanya sudah ada dilewati, jadi bisa dipakai menambah meja berikutnya.
    let next = 1;
    for (let i = 0; added.length < n && i < MAX_TABLES * 2; i += 1, next += 1) {
      const name = `${prefix.trim() || 'Meja'} ${next}`.slice(0, 40);
      if (existing.has(name.toLowerCase())) continue;
      added.push(newTable(name));
    }
    onChange([...tables, ...added]);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onChange(arrayMove(tables, tables.findIndex((t) => t.id === active.id), tables.findIndex((t) => t.id === over.id)));
  };

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      Alert.alert('Disalin', `${what} sudah disalin.`);
    } catch {
      Alert.alert(what, text);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="mb-2 text-[12.5px] font-semibold text-ink-2">Buat sekaligus</p>
        <div className="grid grid-cols-[1fr_auto] items-end gap-2">
          <label className="min-w-0">
            <span className="mb-1 block text-[11.5px] text-ink-3">Nama awalan</span>
            <Input value={prefix} onChange={(e) => setPrefix(e.target.value.slice(0, 20))} />
          </label>
          <label className="w-20">
            <span className="mb-1 block text-[11.5px] text-ink-3">Jumlah</span>
            <Input value={count} onChange={(e) => setCount(e.target.value.replace(/\D/g, '').slice(0, 3))} inputMode="numeric" />
          </label>
        </div>
        <Button size="sm" fullWidth className="mt-2" onClick={addMany} disabled={tables.length >= MAX_TABLES || !Number(count)}>
          Buat {prefix.trim() || 'Meja'} 1 – {Number(count) || 0}
        </Button>
      </div>
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOne())} placeholder="mis. VIP 1, Teras A" />
        </div>
        <Button size="sm" variant="outline" onClick={addOne} disabled={!label.trim() || tables.length >= MAX_TABLES} className="shrink-0 whitespace-nowrap">
          + Tambah
        </Button>
      </div>

      {tables.length > 0 ? (
        <>
          <div className="flex items-center justify-between text-[12px] text-ink-3">
            <span>
              {tables.length} meja · seret ⠿ untuk mengurutkan
            </span>
            <button type="button" onClick={() => copy(tables.map((t) => `${t.label}: ${linkOf(t)}`).join('\n'), 'Semua link meja')} className="cursor-pointer font-semibold text-primary-700">
              Salin semua link
            </button>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={tables.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="scroll-thin max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
                {tables.map((t) => (
                  <SortableRow key={t.id} id={t.id}>
                    {(handle) => (
                      <div className="rounded-lg border border-line bg-white p-1.5">
                        <div className="flex items-center gap-1">
                          {handle}
                          <input
                            value={t.label}
                            onChange={(e) => {
                              const label = e.target.value.slice(0, 40);
                              onChange(tables.map((x) => (x.id === t.id ? { ...x, label, code: encodeTable(label) } : x)));
                            }}
                            onBlur={(e) => !e.target.value.trim() && onChange(tables.map((x) => (x.id === t.id ? { ...x, label: 'Meja', code: encodeTable('Meja') } : x)))}
                            className="min-w-0 flex-1 rounded px-1.5 py-1 text-sm font-semibold text-ink outline-none focus:bg-gray-50"
                            aria-label="Nama meja"
                          />
                          <IconAction label="Salin link" onClick={() => copy(linkOf(t), `Link ${t.label}`)}>
                            ⧉
                          </IconAction>
                          <a href={linkOf(t)} target="_blank" rel="noreferrer" title="Buka" className="flex size-7 items-center justify-center rounded text-ink-3 hover:bg-gray-100">
                            ↗
                          </a>
                          <IconAction label="Hapus" danger onClick={() => onChange(tables.filter((x) => x.id !== t.id))}>
                            ✕
                          </IconAction>
                        </div>
                        <p className={cn('truncate pl-8 font-mono text-[11px]', isDuplicate(t) ? 'text-error-600' : 'text-ink-3')}>
                          {isDuplicate(t) ? 'Nama meja sama dengan meja lain — ganti supaya link berbeda' : `/${encodeTable(t.label)}`}
                        </p>
                      </div>
                    )}
                  </SortableRow>
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <p className="text-[11.5px] text-ink-3">Mengganti nama meja juga mengganti link-nya — cetak ulang QR meja tersebut.</p>
          <button
            type="button"
            onClick={() =>
              Alert.alert('Hapus semua meja?', 'Semua link meja tidak bisa dipakai lagi. Pembeli kembali mengetik nomor meja sendiri.', [
                { text: 'Batal', style: 'cancel' },
                { text: 'Hapus semua', style: 'destructive', onPress: () => onChange([]) },
              ])
            }
            className="w-full cursor-pointer text-center text-[12.5px] font-semibold text-error-600"
          >
            Hapus semua meja
          </button>
        </>
      ) : (
        <p className="rounded-lg border border-dashed border-gray-300 p-3 text-center text-[12.5px] text-ink-3">Belum ada meja — pembeli mengetik nomor meja sendiri saat memilih &quot;Makan di tempat&quot;.</p>
      )}
    </div>
  );
}

function IconAction({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} className={cn('flex size-7 cursor-pointer items-center justify-center rounded hover:bg-gray-100', danger ? 'text-error-600 hover:bg-error-50' : 'text-ink-3')}>
      {children}
    </button>
  );
}
