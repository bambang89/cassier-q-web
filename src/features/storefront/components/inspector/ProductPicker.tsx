'use client';

import { useMemo, useState } from 'react';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext } from '@dnd-kit/core';

import type { PublicProduct } from '@/types/storefront';
import { formatRupiah } from '@/utils/format';
import { SearchIcon } from '@/components/ui/icons/ActionIcons';
import { SortableRow } from '@/features/storefront/components/inspector/ListField';
import { useListSensors } from '@/features/storefront/hooks/useListSensors';

export function ProductPicker({ label, value, products, max, onChange }: { label: string; value: string[]; products: PublicProduct[]; max: number; onChange: (v: string[]) => void }) {
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
                      <span className="text-[12px] text-ink-3">{formatRupiah(p.price)}</span>
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
            <span className="text-[12px] text-ink-3">{formatRupiah(p.price)}</span>
          </button>
        ))}
        {results.length === 0 ? <p className="p-2 text-center text-[12.5px] text-ink-3">Tidak ada produk lain.</p> : null}
      </div>
    </div>
  );
}
