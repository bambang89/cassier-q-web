'use client';

import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext } from '@dnd-kit/core';

import type { StorefrontTable } from '@/types/storefront';
import { Alert } from '@/lib/alert';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { newTable, encodeTable } from '@/features/storefront/utils';
import { IconAction } from '@/features/storefront/components/panels/primitives';
import { SortableRow } from '@/features/storefront/components/inspector/ListField';
import { useListSensors } from '@/features/storefront/hooks/useListSensors';
import { MAX_TABLES } from '@/features/storefront/constants';

export function TablesEditor({ tables, baseUrl, onChange }: { tables: StorefrontTable[]; baseUrl: string; onChange: (tables: StorefrontTable[]) => void }) {
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
