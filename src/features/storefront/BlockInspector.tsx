'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { uploadStorefrontImage } from '@/api/storefrontApi';
import { apiErrorMessage } from '@/api/errors';
import type { BlockStyle, PublicProduct, StorefrontBlock } from '@/types/storefront';
import { Alert } from '@/lib/alert';
import { cn } from '@/lib/cn';
import { photoProblem, pickPhoto } from '@/lib/pickPhoto';
import { BLOCK_DEFS, SOCIAL_PLATFORMS, blockLabel, propsWithDefaults } from '@/lib/storefront/blocks';
import type { FieldDef, SimpleFieldDef } from '@/lib/storefront/blocks';
import { Input, Select, Switch, TextArea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ChevronDownIcon, LockIcon, SearchIcon, TrashIcon } from '@/components/icons/LineIcons';
import { rupiah } from './StorefrontRenderer';

type Props = Record<string, unknown>;
type Item = Props & { id: string };
type Tab = 'content' | 'style' | 'advanced';

export interface InspectorProps {
  block: StorefrontBlock;
  products: PublicProduct[];
  categories: { id: string; name: string }[];
  /** `key` dipakai untuk menggabungkan ketikan beruntun jadi satu langkah undo. */
  onChange: (patch: Partial<StorefrontBlock>, key?: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/** Panel kanan editor: isian, gaya, dan pengaturan lanjutan blok yang dipilih. */
export function BlockInspector({ block, products, categories, onChange, onDuplicate, onDelete }: InspectorProps) {
  const [tab, setTab] = useState<Tab>('content');
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

function Labeled({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {help ? <p className="mt-1 text-[12px] leading-snug text-ink-3">{help}</p> : null}
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <Switch value={value} onChange={onChange} label={label} />
    </div>
  );
}

export function Segmented({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn('min-w-0 flex-1 cursor-pointer rounded-md px-2 py-1.5 text-[12.5px] font-semibold whitespace-nowrap transition', value === o.value ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-2 hover:text-ink')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ColorInput({ value, onChange, presets }: { value: string; onChange: (v: string) => void; presets?: string[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff'} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-10 w-12 cursor-pointer rounded-md border border-line bg-white p-1" aria-label="Pilih warna" />
        <Input value={value} onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 7))} placeholder="#FFFFFF" className="font-mono" />
      </div>
      {presets ? (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((c) => (
            <button key={c} type="button" onClick={() => onChange(c)} aria-label={c} className={cn('size-6 cursor-pointer rounded-full border border-black/10 ring-offset-2', value === c && 'ring-2 ring-gray-900')} style={{ backgroundColor: c }} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const EMOJIS = ['🎉', '🔥', '⭐', '✅', '⚡', '🌿', '💳', '🚚', '🛵', '☕', '🍵', '🍰', '🍔', '🍜', '🍗', '🥤', '💊', '🧺', '🔧', '👗', '🎁', '💯', '❤️', '📍', '🕘', '📣', '🛒', '👩‍🍳', '👨‍⚕️', '✨', '🏷️', '💬'];

function EmojiInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex size-[46px] shrink-0 cursor-pointer items-center justify-center rounded-md border border-line bg-white text-2xl">
          {value || '＋'}
        </button>
        <Input value={value} onChange={(e) => onChange([...e.target.value].slice(0, 4).join(''))} placeholder="Ketik / pilih emoji" />
      </div>
      {open ? (
        <div className="mt-2 grid grid-cols-8 gap-1 rounded-lg border border-line bg-white p-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                onChange(e);
                setOpen(false);
              }}
              className="cursor-pointer rounded p-1 text-xl hover:bg-gray-100"
            >
              {e}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SimpleField({ field, value, onSet }: { field: SimpleFieldDef; value: unknown; onSet: (v: unknown) => void }) {
  const str = value == null ? '' : String(value);
  switch (field.kind) {
    case 'text':
    case 'url':
      return (
        <Labeled label={field.label} help={field.help}>
          <Input value={str} onChange={(e) => onSet(e.target.value)} placeholder={field.placeholder} />
        </Labeled>
      );
    case 'textarea':
      return (
        <Labeled label={field.label} help={field.help}>
          <TextArea value={str} onChange={(e) => onSet(e.target.value)} rows={4} placeholder={field.placeholder} />
        </Labeled>
      );
    case 'number':
      return (
        <Labeled label={field.label} help={field.help}>
          <div className="flex items-center gap-2">
            <Input
              value={str || '0'}
              onChange={(e) => onSet(Math.max(field.min ?? 0, Math.min(field.max ?? 9999, Number(e.target.value.replace(/\D/g, '')) || 0)))}
              inputMode="numeric"
              className="w-24"
            />
            {field.suffix ? <span className="text-[12.5px] text-ink-3">{field.suffix}</span> : null}
          </div>
        </Labeled>
      );
    case 'range':
      return (
        <Labeled label={`${field.label}: ${str || field.min}${field.suffix ?? ''}`} help={field.help}>
          <input type="range" min={field.min} max={field.max} step={field.step ?? 1} value={Number(value ?? field.min)} onChange={(e) => onSet(Number(e.target.value))} className="w-full cursor-pointer accent-primary-600" />
        </Labeled>
      );
    case 'select':
      return (
        <Labeled label={field.label} help={field.help}>
          {field.segmented ? <Segmented value={str} options={field.options} onChange={onSet} /> : <Select value={str} onChange={onSet} options={field.options} />}
        </Labeled>
      );
    case 'toggle':
      return <ToggleRow label={field.label} value={!!value} onChange={onSet} />;
    case 'image':
      return <ImageField label={field.label} value={str} onChange={onSet} />;
    case 'color':
      return (
        <Labeled label={field.label} help={field.help}>
          <ColorInput value={str} onChange={onSet} />
        </Labeled>
      );
    case 'datetime':
      return (
        <Labeled label={field.label} help={field.help}>
          <Input type="datetime-local" value={str} onChange={(e) => onSet(e.target.value)} />
        </Labeled>
      );
    case 'emoji':
      return (
        <Labeled label={field.label} help={field.help}>
          <EmojiInput value={str} onChange={onSet} />
        </Labeled>
      );
    default:
      return null;
  }
}

function Field({
  field,
  value,
  onSet,
  products,
  categories,
}: {
  field: FieldDef;
  value: unknown;
  onSet: (v: unknown) => void;
  products: PublicProduct[];
  categories: { id: string; name: string }[];
}) {
  switch (field.kind) {
    case 'category':
      return (
        <Labeled label={field.label}>
          <Select value={String(value || '')} onChange={onSet} placeholder="Pilih kategori…" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
        </Labeled>
      );
    case 'product':
      return (
        <Labeled label={field.label}>
          <Select value={String(value || '')} onChange={onSet} placeholder="Pilih produk…" options={products.map((p) => ({ value: p.id, label: `${p.name} · ${rupiah(p.price)}` }))} />
        </Labeled>
      );
    case 'products':
      return <ProductPicker label={field.label} value={Array.isArray(value) ? (value as string[]) : []} products={products} max={field.max ?? 40} onChange={onSet} />;
    case 'list':
      return <ListField field={field} value={Array.isArray(value) ? (value as Item[]) : []} onChange={onSet} />;
    default:
      return <SimpleField field={field} value={value} onSet={onSet} />;
  }
}

// ── Gaya blok ────────────────────────────────────────────────────────

const BG_OPTIONS: { value: NonNullable<BlockStyle['background']>; label: string; swatch: string }[] = [
  { value: 'none', label: 'Tanpa', swatch: 'repeating-conic-gradient(#e2e8f0 0 25%, #fff 0 50%) 50% / 10px 10px' },
  { value: 'surface', label: 'Kartu', swatch: '#ffffff' },
  { value: 'soft', label: 'Lembut', swatch: 'color-mix(in srgb, var(--sf-preview, #2563eb) 15%, white)' },
  { value: 'theme', label: 'Tema', swatch: 'var(--sf-preview, #2563eb)' },
  { value: 'dark', label: 'Gelap', swatch: '#0B1F33' },
  { value: 'custom', label: 'Lainnya', swatch: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' },
];

function StyleFields({ block, onSet }: { block: StorefrontBlock; onSet: (key: keyof BlockStyle, value: unknown) => void }) {
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

// ── Gambar ───────────────────────────────────────────────────────────

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = async (file: File | null | undefined) => {
    if (!file) return;
    const problem = photoProblem(file);
    if (problem) return Alert.alert('Gambar tidak valid', problem);
    setUploading(true);
    try {
      onChange(await uploadStorefrontImage(file));
    } catch (error) {
      Alert.alert('Gagal', apiErrorMessage(error, 'Gambar gagal diunggah.'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      {/* File gambar dari komputer bisa langsung diseret ke kotak ini. */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void uploadFile(e.dataTransfer.files?.[0]);
        }}
        className={cn('overflow-hidden rounded-xl border border-dashed bg-gray-50 transition', dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300')}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="aspect-[16/9] w-full object-cover" />
        ) : (
          <div className="flex aspect-[16/9] flex-col items-center justify-center gap-1 text-center text-sm text-ink-3">
            <span className="text-2xl">🖼️</span>
            {uploading ? 'Mengunggah…' : 'Seret gambar ke sini'}
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={async () => uploadFile(await pickPhoto())} loading={uploading} className="flex-1">
          {value ? 'Ganti Gambar' : 'Unggah Gambar'}
        </Button>
        {value ? (
          <Button size="sm" variant="ghost" onClick={() => onChange('')}>
            Hapus
          </Button>
        ) : null}
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-[12px] text-ink-3">atau tempel URL gambar</summary>
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" className="mt-1" />
      </details>
    </div>
  );
}

// ── Daftar item (slide, foto, FAQ, …) dengan drag & drop ─────────────

export function useListSensors() {
  return useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
}

function ListField({ field, value, onChange }: { field: Extract<FieldDef, { kind: 'list' }>; value: Item[]; onChange: (v: Item[]) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const sensors = useListSensors();
  const max = field.max ?? 20;

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onChange(arrayMove(value, value.findIndex((i) => i.id === active.id), value.findIndex((i) => i.id === over.id)));
  };
  const update = (id: string, key: string, v: unknown) => onChange(value.map((i) => (i.id === id ? { ...i, [key]: v } : i)));
  const titleOf = (item: Item, index: number) => {
    const raw = String(item[field.titleKey] ?? '').trim();
    if (field.titleKey === 'platform') return SOCIAL_PLATFORMS.find((p) => p.value === raw)?.label ?? raw;
    return raw || `${field.itemLabel} ${index + 1}`;
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{field.label}</span>
        <span className="text-[12px] text-ink-3">
          {value.length}/{max} · seret ⠿ untuk mengurutkan
        </span>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={value.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {value.map((item, index) => (
              <SortableRow key={item.id} id={item.id}>
                {(handle) => (
                  <div className="rounded-lg border border-line bg-white">
                    <div className="flex items-center gap-1 p-1.5">
                      {handle}
                      <button type="button" onClick={() => setOpen(open === item.id ? null : item.id)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left">
                        {typeof item.imageUrl === 'string' && item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt="" className="size-7 shrink-0 rounded object-cover" />
                        ) : typeof item.icon === 'string' && item.icon ? (
                          <span className="text-lg">{item.icon}</span>
                        ) : null}
                        <span className="truncate text-sm font-semibold text-ink">{titleOf(item, index)}</span>
                        <ChevronDownIcon size={14} className={cn('ml-auto shrink-0 text-ink-3 transition', open === item.id && 'rotate-180')} />
                      </button>
                      <button
                        type="button"
                        title="Duplikat"
                        disabled={value.length >= max}
                        onClick={() => onChange([...value.slice(0, index + 1), { ...item, id: Math.random().toString(36).slice(2, 9) }, ...value.slice(index + 1)])}
                        className="flex size-7 cursor-pointer items-center justify-center rounded text-ink-3 hover:bg-gray-100 disabled:opacity-30"
                      >
                        ⧉
                      </button>
                      <button type="button" title="Hapus" onClick={() => onChange(value.filter((i) => i.id !== item.id))} className="flex size-7 cursor-pointer items-center justify-center rounded text-error-600 hover:bg-error-50">
                        ✕
                      </button>
                    </div>
                    {open === item.id ? (
                      <div className="space-y-3 border-t border-line p-3">
                        {field.itemFields.map((f) => (
                          <SimpleField key={f.key} field={f} value={item[f.key]} onSet={(v) => update(item.id, f.key, v)} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </SortableRow>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button
        size="sm"
        variant="outline"
        fullWidth
        className="mt-2"
        disabled={value.length >= max}
        onClick={() => {
          const item = field.newItem() as Item;
          onChange([...value, item]);
          setOpen(item.id);
        }}
      >
        + Tambah {field.itemLabel}
      </Button>
    </div>
  );
}

export function SortableRow({ id, children }: { id: string; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const handle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      aria-label="Seret untuk mengurutkan"
      className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-ink-3 hover:bg-gray-100 active:cursor-grabbing"
    >
      ⠿
    </button>
  );
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className={cn('relative', isDragging && 'z-10 opacity-80 shadow-lg')}>
      {children(handle)}
    </div>
  );
}

// ── Pemilih produk manual ────────────────────────────────────────────

function ProductPicker({ label, value, products, max, onChange }: { label: string; value: string[]; products: PublicProduct[]; max: number; onChange: (v: string[]) => void }) {
  const [query, setQuery] = useState('');
  const sensors = useListSensors();
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const chosen = value.filter((id) => byId.has(id));
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => !value.includes(p.id) && (!q || p.name.toLowerCase().includes(q))).slice(0, 30);
  }, [products, value, query]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onChange(arrayMove(chosen, chosen.indexOf(String(active.id)), chosen.indexOf(String(over.id))));
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="text-[12px] text-ink-3">
          {chosen.length}/{max}
        </span>
      </div>
      {chosen.length === 0 ? <p className="rounded-lg bg-gray-50 p-3 text-center text-[13px] text-ink-3">Belum ada produk dipilih.</p> : null}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={chosen} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {chosen.map((id) => {
              const p = byId.get(id)!;
              return (
                <SortableRow key={id} id={id}>
                  {(handle) => (
                    <div className="flex items-center gap-1 rounded-lg border border-line bg-white p-1.5">
                      {handle}
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{p.name}</span>
                      <span className="text-[12px] text-ink-3">{rupiah(p.price)}</span>
                      <button type="button" onClick={() => onChange(value.filter((x) => x !== id))} className="flex size-7 cursor-pointer items-center justify-center rounded text-error-600 hover:bg-error-50" aria-label="Lepas">
                        ✕
                      </button>
                    </div>
                  )}
                </SortableRow>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
      <label className="mt-3 flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3">
        <SearchIcon size={15} className="text-ink-3" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari produk untuk ditambah…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
      </label>
      <div className="scroll-thin mt-1.5 max-h-56 space-y-1 overflow-y-auto">
        {results.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={chosen.length >= max}
            onClick={() => onChange([...chosen, p.id])}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-gray-50 disabled:opacity-40"
          >
            <span className="text-primary-600">＋</span>
            <span className="min-w-0 flex-1 truncate">{p.name}</span>
            <span className="text-[12px] text-ink-3">{rupiah(p.price)}</span>
          </button>
        ))}
        {results.length === 0 ? <p className="p-2 text-center text-[12.5px] text-ink-3">Tidak ada produk lain.</p> : null}
      </div>
    </div>
  );
}

