'use client';

import type { StorefrontTheme, FontKey } from '@/types/storefront';
import { cn } from '@/utils/cn';
import { Select } from '@/components/ui/Field';
import { FONTS, THEME_STYLES, FONT_OPTIONS, THEME_PRESETS } from '@/features/storefront/constants';
import { ColorInput, Segmented } from '@/features/storefront/components/inspector/fields';
import { Row, Section } from '@/features/storefront/components/panels/primitives';

export function ProductCardThumb({ kind, color }: { kind: StorefrontTheme['productCard']; color: string }) {
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
