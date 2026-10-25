'use client';

import { useState } from 'react';

import type { BlockStyle } from '@/types/storefront';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { TrashIcon, LockIcon } from '@/components/ui/icons/ActionIcons';
import type { InspectorTab, InspectorProps } from '@/features/storefront/types';
import { BLOCK_DEFS } from '@/features/storefront/blockDefs';
import { propsWithDefaults, blockLabel } from '@/features/storefront/utils';
import { Labeled, ToggleRow } from '@/features/storefront/components/inspector/fields';
import { Field } from '@/features/storefront/components/inspector/Field';
import { StyleFields } from '@/features/storefront/components/inspector/StyleFields';

/** Panel kanan editor: isian, gaya, dan pengaturan lanjutan blok yang dipilih. */
export function BlockInspector({ block, products, categories, onChange, onDuplicate, onDelete }: InspectorProps) {
  const [tab, setTab] = useState<InspectorTab>('content');
  const def = BLOCK_DEFS[block.type];
  const props = propsWithDefaults(block);
  const setProp = (key: string, value: unknown) => onChange({ props: { ...block.props, [key]: value } }, `${block.id}:p:${key}`);
  const setStyle = (key: keyof BlockStyle, value: unknown) => onChange({ style: { ...block.style, [key]: value } }, `${block.id}:s:${key}`);

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl">{def.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink">{blockLabel(block)}</p>
          <p className="truncate text-[12.5px] text-ink-3">{def.description}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1">
        {(
          [
            ['content', 'Konten'],
            ['style', 'Gaya'],
            ['advanced', 'Lanjutan'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn('cursor-pointer rounded-md py-1.5 text-[13px] font-semibold transition', tab === key ? 'bg-white text-ink shadow-sm' : 'text-ink-2 hover:text-ink')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {tab === 'content'
          ? def.fields
              .filter((f) => !f.showIf || f.showIf(props))
              .map((field) => <Field key={field.key} field={field} value={props[field.key]} onSet={(v) => setProp(field.key, v)} products={products} categories={categories} />)
          : null}
        {tab === 'style' ? <StyleFields block={block} onSet={setStyle} /> : null}
        {tab === 'advanced' ? (
          <>
            <Labeled label="Nama di panel Lapisan">
              <Input value={block.name ?? ''} onChange={(e) => onChange({ name: e.target.value.slice(0, 60) }, `${block.id}:name`)} placeholder={def.label} />
            </Labeled>
            <Labeled label="Id jangkar" help={`Tombol dengan tautan #${block.style?.anchor || 'id'} akan melompat ke blok ini.`}>
              <Input
                value={block.style?.anchor ?? ''}
                onChange={(e) => setStyle('anchor', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) || undefined)}
                placeholder={block.type === 'products' ? 'produk' : 'mis. promo'}
              />
            </Labeled>
            <ToggleRow label="Sembunyikan dari pembeli" value={!!block.hidden} onChange={(v) => onChange({ hidden: v })} />
            <ToggleRow label="Kunci blok (tidak bisa diseret/dihapus)" value={!!block.locked} onChange={(v) => onChange({ locked: v })} />
          </>
        ) : null}
      </div>

      <div className="mt-6 flex gap-2 border-t border-line pt-4">
        <Button size="sm" variant="outline" onClick={onDuplicate} className="flex-1">
          Duplikat
        </Button>
        <Button size="sm" variant="dangerOutline" onClick={onDelete} disabled={block.locked} leftIcon={block.locked ? <LockIcon size={14} /> : <TrashIcon size={14} />} className="flex-1">
          Hapus
        </Button>
      </div>
    </div>
  );
}

// ── Isian umum ───────────────────────────────────────────────────────

// ── Gaya blok ────────────────────────────────────────────────────────

// ── Gambar ───────────────────────────────────────────────────────────

// ── Daftar item (slide, foto, FAQ, …) dengan drag & drop ─────────────

// ── Pemilih produk manual ────────────────────────────────────────────

