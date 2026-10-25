'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { closestCenter, pointerWithin, useDraggable, useDroppable } from '@dnd-kit/core';
import type { CollisionDetection } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { BlockType, PublicStorefront, StorefrontBlock } from '@/types/storefront';
import { cn } from '@/lib/cn';
import { BLOCK_DEFS, BLOCK_GROUPS, BLOCK_ORDER, blockLabel } from '@/lib/storefront/blocks';
import { EyeIcon, EyeOffIcon, LockIcon, SearchIcon, UnlockIcon } from '@/components/icons/LineIcons';
import { FloatingWhatsapp, StoreFooter, StoreHeader, StorefrontBlockView, StorefrontProvider, blockAnchors } from './StorefrontRenderer';

export const PALETTE_PREFIX = 'palette:';
export const LAYER_PREFIX = 'layer:';

/**
 * Deteksi tabrakan editor: blok baru dari palet memakai posisi pointer (jatuh tepat di blok
 * yang ditunjuk), urutan di panel Lapisan hanya melawan baris lapisan, dan blok di kanvas
 * hanya melawan blok kanvas.
 */
export const builderCollision: CollisionDetection = (args) => {
  const id = String(args.active.id);
  const containers = args.droppableContainers;
  if (id.startsWith(PALETTE_PREFIX)) {
    const hits = pointerWithin({ ...args, droppableContainers: containers.filter((c) => !String(c.id).startsWith(LAYER_PREFIX)) });
    const block = hits.find((c) => c.id !== 'canvas');
    return block ? [block] : hits;
  }
  if (id.startsWith(LAYER_PREFIX)) return closestCenter({ ...args, droppableContainers: containers.filter((c) => String(c.id).startsWith(LAYER_PREFIX)) });
  return closestCenter({ ...args, droppableContainers: containers.filter((c) => c.id !== 'canvas' && !String(c.id).startsWith(LAYER_PREFIX)) });
};

// ── Palet blok ───────────────────────────────────────────────────────

function PaletteItem({ type, onAdd, disabled }: { type: BlockType; onAdd: (type: BlockType) => void; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `${PALETTE_PREFIX}${type}`, data: { type }, disabled });
  const def = BLOCK_DEFS[type];
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onAdd(type)}
      disabled={disabled}
      {...listeners}
      {...attributes}
      className={cn(
        'group flex w-full cursor-grab touch-none flex-col items-start gap-2 rounded-xl border border-line bg-white p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40',
        isDragging && 'scale-95 opacity-40',
      )}
      title={def.description}
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 text-lg transition group-hover:scale-110 group-hover:from-primary-50 group-hover:to-primary-100">{def.emoji}</span>
      <span className="min-w-0">
        <span className="block text-[13px] leading-tight font-semibold text-ink">{def.label}</span>
        <span className="mt-0.5 line-clamp-2 block text-[11.5px] leading-snug text-ink-3">{def.description}</span>
      </span>
    </button>
  );
}

export function Palette({ onAdd, full }: { onAdd: (type: BlockType) => void; full: boolean }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const types = BLOCK_ORDER.filter((t) => !q || `${BLOCK_DEFS[t].label} ${BLOCK_DEFS[t].description}`.toLowerCase().includes(q));
  return (
    <div>
      <label className="mb-3 flex h-10 items-center gap-2 rounded-lg border border-line bg-gray-50 px-3 focus-within:border-primary-500 focus-within:bg-white">
        <SearchIcon size={15} className="text-ink-3" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari blok…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
      </label>
      {full ? <p className="mb-3 rounded-lg bg-warning-50 p-2.5 text-[12.5px] text-warning-700">Batas 40 blok tercapai. Hapus blok lain untuk menambah.</p> : null}
      <div className="space-y-4">
        {BLOCK_GROUPS.map((group) => {
          const items = types.filter((t) => BLOCK_DEFS[t].group === group.key);
          if (items.length === 0) return null;
          return (
            <div key={group.key}>
              <p className="mb-2 text-[11px] font-bold tracking-[0.12em] text-ink-3 uppercase">{group.label}</p>
              <div className="grid auto-rows-fr grid-cols-2 gap-2">
                {items.map((type) => (
                  <PaletteItem key={type} type={type} onAdd={onAdd} disabled={full} />
                ))}
              </div>
            </div>
          );
        })}
        {types.length === 0 ? <p className="py-6 text-center text-sm text-ink-3">Tidak ada blok “{query}”.</p> : null}
      </div>
    </div>
  );
}

export function PaletteDragPreview({ type }: { type: BlockType }) {
  const def = BLOCK_DEFS[type];
  return (
    <div className="flex w-60 rotate-[-2deg] items-center gap-3 rounded-xl border border-primary-300 bg-white/95 p-3 shadow-float backdrop-blur">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary-50 text-lg">{def.emoji}</span>
      <span>
        <span className="block text-sm font-semibold">{def.label}</span>
        <span className="block text-[11.5px] text-ink-3">Lepas di posisi yang diinginkan</span>
      </span>
    </div>
  );
}

// ── Kanvas ───────────────────────────────────────────────────────────

export type PageSelection = 'header' | 'footer' | null;

/** Pratinjau toko yang bisa diurutkan & disisipi blok dengan drag & drop. */
export function BuilderCanvas({
  data,
  blocks,
  selectedId,
  onSelect,
  pageSelection,
  onSelectPage,
  dropIndex,
  dragging,
  justAdded,
  onInsertAt,
  toolbar,
}: {
  data: PublicStorefront;
  blocks: StorefrontBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  pageSelection: PageSelection;
  onSelectPage: (part: 'header' | 'footer') => void;
  /** Posisi sisip saat blok dari palet sedang diseret di atas kanvas. */
  dropIndex: number | null;
  dragging: boolean;
  justAdded: string | null;
  onInsertAt: (index: number) => void;
  toolbar: (block: StorefrontBlock, index: number) => ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });
  const anchors = blockAnchors(blocks);
  return (
    <StorefrontProvider data={data} editor>
      <div data-sf-root className="relative flex min-h-[640px] flex-col">
        <StoreHeader onSelect={() => onSelectPage('header')} selected={pageSelection === 'header'} />
        <div ref={setNodeRef} className={cn('relative flex-1 pt-2 transition-colors', isOver && blocks.length === 0 && 'bg-primary-50/60')}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block, index) => (
              <div key={block.id}>
                <InsertSlot index={index} active={dropIndex === index} dragging={dragging} onInsert={onInsertAt} />
                <SortableBlock block={block} selected={selectedId === block.id} onSelect={onSelect} toolbar={toolbar(block, index)} animate={justAdded === block.id}>
                  <StorefrontBlockView block={block} anchor={anchors[block.id]} />
                </SortableBlock>
              </div>
            ))}
          </SortableContext>
          {blocks.length > 0 ? <InsertSlot index={blocks.length} active={dropIndex === blocks.length} dragging={dragging} onInsert={onInsertAt} /> : null}
          {blocks.length === 0 ? (
            <div className={cn('m-4 flex h-72 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition', isOver ? 'scale-[1.01] border-primary-400 bg-white text-primary-700' : 'border-gray-300 text-ink-3')}>
              <span className="text-4xl">🧩</span>
              <p className="font-semibold">Halaman masih kosong</p>
              <p className="max-w-xs text-sm">Seret blok dari panel kiri ke sini, atau pilih template siap pakai.</p>
              <button type="button" onClick={() => onInsertAt(0)} className="mt-2 cursor-pointer rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white">
                + Tambah blok
              </button>
            </div>
          ) : null}
        </div>
        <StoreFooter onSelect={() => onSelectPage('footer')} selected={pageSelection === 'footer'} />
        <FloatingWhatsapp contained />
      </div>
    </StorefrontProvider>
  );
}

/** Celah antar blok: garis biru saat blok baru akan jatuh di sini, tombol + saat disorot. */
function InsertSlot({ index, active, dragging, onInsert }: { index: number; active: boolean; dragging: boolean; onInsert: (index: number) => void }) {
  return (
    <div className={cn('group/slot relative z-10 flex items-center justify-center transition-all duration-200', active ? 'h-10' : 'h-0')}>
      {active ? (
        <div className="absolute inset-x-4 flex animate-drop-pulse items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary-500 ring-4 ring-primary-200" />
          <span className="h-[3px] flex-1 rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500" />
          <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[11px] font-bold text-white shadow">Lepas di sini</span>
          <span className="h-[3px] flex-1 rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500" />
          <span className="size-2.5 rounded-full bg-primary-500 ring-4 ring-primary-200" />
        </div>
      ) : !dragging ? (
        <div className="absolute inset-x-0 -top-3 flex h-6 items-center justify-center opacity-0 transition-opacity duration-200 group-hover/slot:opacity-100 hover:opacity-100">
          <span className="absolute inset-x-6 h-px bg-primary-300" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInsert(index);
            }}
            className="relative flex h-6 cursor-pointer items-center gap-1 rounded-full bg-primary-600 px-2.5 text-[11px] font-bold text-white shadow-md transition hover:scale-105"
          >
            + Sisipkan blok
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SortableBlock({
  block,
  selected,
  onSelect,
  toolbar,
  animate,
  children,
}: {
  block: StorefrontBlock;
  selected: boolean;
  onSelect: (id: string) => void;
  toolbar: ReactNode;
  animate: boolean;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: block.id, disabled: block.locked });
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (animate) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [animate]);
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selected]);

  const showOn = block.style?.showOn;
  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        ref.current = node;
      }}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
      className={cn(
        'group/block relative cursor-pointer outline-2 -outline-offset-2 transition-[outline-color,opacity,box-shadow] duration-200',
        selected ? 'outline outline-primary-500' : 'outline outline-transparent hover:outline-primary-300/70',
        isDragging && 'z-20 opacity-90 shadow-[0_24px_60px_rgb(11_31_51/0.28)]',
        block.hidden && 'opacity-40 saturate-50',
        animate && 'animate-block-in',
      )}
    >
      <div
        className={cn(
          'absolute top-2 right-2 z-20 flex items-center gap-0.5 rounded-xl bg-navy-900/95 p-1 text-white shadow-lg backdrop-blur transition duration-200',
          selected ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0 group-hover/block:pointer-events-auto group-hover/block:translate-y-0 group-hover/block:opacity-100',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...listeners}
          {...attributes}
          disabled={block.locked}
          aria-label="Seret untuk memindah"
          className="flex h-7 cursor-grab touch-none items-center gap-1.5 rounded-lg px-2 text-[12px] font-semibold hover:bg-white/10 active:cursor-grabbing disabled:cursor-not-allowed"
        >
          {block.locked ? <LockIcon size={12} /> : <span className="text-[13px] leading-none">⠿</span>}
          {BLOCK_DEFS[block.type].emoji} {blockLabel(block)}
        </button>
        {toolbar}
      </div>
      {block.hidden || (showOn && showOn !== 'all') ? (
        <div className="pointer-events-none absolute top-2 left-2 z-20 flex gap-1">
          {block.hidden ? <span className="rounded-full bg-gray-900/80 px-2 py-0.5 text-[10.5px] font-bold text-white">Tersembunyi</span> : null}
          {showOn === 'mobile' ? <span className="rounded-full bg-primary-600/90 px-2 py-0.5 text-[10.5px] font-bold text-white">📱 HP saja</span> : null}
          {showOn === 'desktop' ? <span className="rounded-full bg-primary-600/90 px-2 py-0.5 text-[10.5px] font-bold text-white">🖥 Desktop saja</span> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function ToolButton({ label, onClick, danger, disabled, children }: { label: string; onClick: () => void; danger?: boolean; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn('flex size-7 cursor-pointer items-center justify-center rounded-lg text-[13px] transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30', danger && 'text-red-300 hover:bg-red-500/20')}
    >
      {children}
    </button>
  );
}

// ── Panel Lapisan ────────────────────────────────────────────────────

export function LayersPanel({
  blocks,
  selectedId,
  onSelect,
  onToggleHidden,
  onToggleLocked,
  pageSelection,
  onSelectPage,
}: {
  blocks: StorefrontBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onToggleLocked: (id: string) => void;
  pageSelection: PageSelection;
  onSelectPage: (part: 'header' | 'footer') => void;
}) {
  const ids = useMemo(() => blocks.map((b) => `${LAYER_PREFIX}${b.id}`), [blocks]);
  return (
    <div>
      <p className="mb-3 text-[12.5px] text-ink-3">Urutan halaman dari atas ke bawah. Seret ⠿ untuk memindah, klik untuk mengatur.</p>
      <FixedLayer label="Header (kepala halaman)" emoji="🔝" active={pageSelection === 'header'} onClick={() => onSelectPage('header')} />
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="my-1.5 space-y-1.5">
          {blocks.map((block, index) => (
            <LayerRow key={block.id} block={block} index={index} selected={selectedId === block.id} onSelect={onSelect} onToggleHidden={onToggleHidden} onToggleLocked={onToggleLocked} />
          ))}
        </div>
      </SortableContext>
      {blocks.length === 0 ? <p className="my-2 rounded-lg bg-gray-50 p-4 text-center text-sm text-ink-3">Belum ada blok.</p> : null}
      <FixedLayer label="Footer (kaki halaman)" emoji="🔚" active={pageSelection === 'footer'} onClick={() => onSelectPage('footer')} />
    </div>
  );
}

function FixedLayer({ label, emoji, active, onClick }: { label: string; emoji: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn('flex w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-left text-[13px] font-semibold transition', active ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-300 text-ink-2 hover:bg-gray-50')}>
      <span>{emoji}</span> {label}
    </button>
  );
}

function LayerRow({
  block,
  index,
  selected,
  onSelect,
  onToggleHidden,
  onToggleLocked,
}: {
  block: StorefrontBlock;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onToggleLocked: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: `${LAYER_PREFIX}${block.id}`, disabled: block.locked });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'flex items-center gap-1 rounded-lg border bg-white p-1 transition-[border-color,background-color,box-shadow]',
        selected ? 'border-primary-400 bg-primary-50 shadow-sm' : 'border-line hover:border-gray-300',
        isDragging && 'z-10 shadow-lg',
        block.hidden && 'opacity-55',
      )}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...listeners}
        {...attributes}
        disabled={block.locked}
        aria-label="Seret untuk memindah"
        className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-ink-3 hover:bg-gray-100 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
      >
        ⠿
      </button>
      <button type="button" onClick={() => onSelect(block.id)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left">
        <span className="w-4 text-right text-[11px] text-ink-3 tabular-nums">{index + 1}</span>
        <span>{BLOCK_DEFS[block.type].emoji}</span>
        <span className="truncate text-[13px] font-semibold text-ink">{blockLabel(block)}</span>
        {block.style?.showOn && block.style.showOn !== 'all' ? <span className="shrink-0 text-[11px]">{block.style.showOn === 'mobile' ? '📱' : '🖥'}</span> : null}
      </button>
      <button type="button" onClick={() => onToggleHidden(block.id)} title={block.hidden ? 'Tampilkan' : 'Sembunyikan'} className="flex size-7 cursor-pointer items-center justify-center rounded text-ink-3 hover:bg-gray-100">
        {block.hidden ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
      </button>
      <button type="button" onClick={() => onToggleLocked(block.id)} title={block.locked ? 'Buka kunci' : 'Kunci'} className={cn('flex size-7 cursor-pointer items-center justify-center rounded hover:bg-gray-100', block.locked ? 'text-warning-600' : 'text-ink-3')}>
        {block.locked ? <LockIcon size={14} /> : <UnlockIcon size={14} />}
      </button>
    </div>
  );
}
