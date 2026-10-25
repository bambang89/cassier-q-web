'use client';

import type { StorefrontEditor } from '@/features/storefront/types';
import { BlockInspector } from '@/features/storefront/components/BlockInspector';

/** Panel pengaturan blok terpilih (dipakai di laci kanan & lembar HP). */
export function EditorInspector({ editor }: { editor: StorefrontEditor }) {
  const { selected } = editor;
  if (!selected) return null;
  return (
    <BlockInspector
      key={selected.id}
      block={selected}
      products={editor.products}
      categories={editor.usedCategories}
      onChange={(patch, key) => editor.updateBlock(selected.id, patch, key)}
      onDuplicate={() => editor.duplicateBlock(selected.id)}
      onDelete={() => editor.removeBlock(selected.id)}
    />
  );
}
