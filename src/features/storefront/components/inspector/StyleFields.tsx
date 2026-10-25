'use client';

import type { BlockStyle, StorefrontBlock } from '@/types/storefront';
import { cn } from '@/utils/cn';
import { BG_OPTIONS } from '@/features/storefront/constants';
import { BLOCK_DEFS } from '@/features/storefront/blockDefs';
import { ColorInput, Labeled, Segmented } from '@/features/storefront/components/inspector/fields';

export function StyleFields({ block, onSet }: { block: StorefrontBlock; onSet: (key: keyof BlockStyle, value: unknown) => void }) {
  const style: BlockStyle = { paddingY: 'sm', width: 'contained', align: 'left', showOn: 'all', background: 'none', textTone: 'auto', ...BLOCK_DEFS[block.type].style, ...block.style };
  return (
    <>
      <Labeled label="Latar belakang">
        <div className="grid grid-cols-3 gap-2">
          {BG_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onSet('background', o.value)}
              className={cn('flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-[12.5px] font-semibold', style.background === o.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-line hover:border-gray-300')}
            >
              <span className="size-5 shrink-0 rounded-full border border-black/10" style={{ background: o.swatch }} />
              {o.label}
            </button>
          ))}
        </div>
      </Labeled>
      {style.background === 'custom' ? (
        <Labeled label="Warna latar">
          <ColorInput value={style.backgroundColor ?? '#FFFFFF'} onChange={(v) => onSet('backgroundColor', v)} presets={['#FFFFFF', '#F8FAFC', '#FEF3C7', '#DCFCE7', '#E0F2FE', '#FCE7F3', '#1E293B', '#7C2D12']} />
        </Labeled>
      ) : null}
      <Labeled label="Warna teks">
        <Segmented
          value={style.textTone ?? 'auto'}
          onChange={(v) => onSet('textTone', v)}
          options={[
            { value: 'auto', label: 'Otomatis' },
            { value: 'dark', label: 'Gelap' },
            { value: 'light', label: 'Terang' },
          ]}
        />
      </Labeled>
      <Labeled label="Jarak atas & bawah">
        <Segmented
          value={style.paddingY ?? 'sm'}
          onChange={(v) => onSet('paddingY', v)}
          options={[
            { value: 'none', label: '0' },
            { value: 'sm', label: 'S' },
            { value: 'md', label: 'M' },
            { value: 'lg', label: 'L' },
            { value: 'xl', label: 'XL' },
          ]}
        />
      </Labeled>
      <Labeled label="Lebar" help="Lebar penuh: blok menempel ke tepi layar (cocok untuk banner & gambar).">
        <Segmented
          value={style.width ?? 'contained'}
          onChange={(v) => onSet('width', v)}
          options={[
            { value: 'contained', label: 'Rapi di tengah' },
            { value: 'full', label: 'Penuh' },
          ]}
        />
      </Labeled>
      <Labeled label="Perataan teks">
        <Segmented
          value={style.align ?? 'left'}
          onChange={(v) => onSet('align', v)}
          options={[
            { value: 'left', label: 'Kiri' },
            { value: 'center', label: 'Tengah' },
            { value: 'right', label: 'Kanan' },
          ]}
        />
      </Labeled>
      <Labeled label="Tampil di" help="Di editor blok tetap terlihat; pratinjau perangkat mengikuti pengaturan ini.">
        <Segmented
          value={style.showOn ?? 'all'}
          onChange={(v) => onSet('showOn', v)}
          options={[
            { value: 'all', label: 'Semua' },
            { value: 'mobile', label: 'HP saja' },
            { value: 'desktop', label: 'Desktop saja' },
          ]}
        />
      </Labeled>
    </>
  );
}
