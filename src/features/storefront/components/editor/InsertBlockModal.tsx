'use client';

import type { BlockType } from '@/types/storefront';
import { Modal } from '@/components/ui/Modal';
import type { StorefrontEditor } from '@/features/storefront/types';
import { BLOCK_DEFS } from '@/features/storefront/blockDefs';

/** Sisip blok di posisi tertentu (tombol "+ Sisipkan blok" di kanvas). */
export function InsertBlockModal({ editor }: { editor: StorefrontEditor }) {
  const { insertAt, setInsertAt, full, addBlock } = editor;
  return (
    <Modal isOpen={insertAt !== null} onClose={() => setInsertAt(null)} title="Sisipkan Blok" size="xl">
      <div className="grid max-h-[70dvh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
        {(Object.keys(BLOCK_DEFS) as BlockType[]).map((type) => (
          <button
            key={type}
            type="button"
            disabled={full}
            onClick={() => {
              addBlock(type, insertAt ?? undefined);
              setInsertAt(null);
            }}
            className="group flex cursor-pointer flex-col items-start gap-2 rounded-xl border border-line p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card disabled:opacity-40"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-gray-100 text-xl transition group-hover:scale-110 group-hover:bg-primary-50">{BLOCK_DEFS[type].emoji}</span>
            <span>
              <span className="block text-sm font-semibold text-ink">{BLOCK_DEFS[type].label}</span>
              <span className="line-clamp-2 block text-[12px] text-ink-3">{BLOCK_DEFS[type].description}</span>
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
