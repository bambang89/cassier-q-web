'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext } from '@dnd-kit/core';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { ChevronDownIcon } from '@/components/ui/icons/ActionIcons';
import { SOCIAL_PLATFORMS } from '@/features/storefront/blockDefs/shared';
import { SimpleField } from '@/features/storefront/components/inspector/SimpleField';
import { useListSensors } from '@/features/storefront/hooks/useListSensors';
import type { FieldDef, InspectorListItem } from '@/features/storefront/types';

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

export function ListField({ field, value, onChange }: { field: Extract<FieldDef, { kind: 'list' }>; value: InspectorListItem[]; onChange: (v: InspectorListItem[]) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const sensors = useListSensors();
  const max = field.max ?? 20;

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onChange(arrayMove(value, value.findIndex((i) => i.id === active.id), value.findIndex((i) => i.id === over.id)));
  };
  const update = (id: string, key: string, v: unknown) => onChange(value.map((i) => (i.id === id ? { ...i, [key]: v } : i)));
  const titleOf = (item: InspectorListItem, index: number) => {
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
          const item = field.newItem() as InspectorListItem;
          onChange([...value, item]);
          setOpen(item.id);
        }}
      >
        + Tambah {field.itemLabel}
      </Button>
    </div>
  );
}
