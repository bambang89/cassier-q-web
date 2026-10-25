'use client';

import type { StorefrontBlock } from '@/types/storefront';
import type { StorefrontEditor } from '@/features/storefront/types';
import { ToolButton } from '@/features/storefront/components/BuilderCanvas';

/** Tombol cepat di atas blok terpilih pada kanvas. */
export function EditorBlockToolbar({ editor, block, index }: { editor: StorefrontEditor; block: StorefrontBlock; index: number }) {
  const { doc, full } = editor;
  return (
    <>
      <ToolButton label="Naik (Alt+↑)" onClick={() => editor.moveBlock(block.id, -1)} disabled={index === 0}>
        ↑
      </ToolButton>
      <ToolButton label="Turun (Alt+↓)" onClick={() => editor.moveBlock(block.id, 1)} disabled={index === doc.blocks.length - 1}>
        ↓
      </ToolButton>
      <ToolButton label={block.hidden ? 'Tampilkan' : 'Sembunyikan'} onClick={() => editor.updateBlock(block.id, { hidden: !block.hidden })}>
        {block.hidden ? '◎' : '◉'}
      </ToolButton>
      <ToolButton label="Duplikat (Ctrl+D)" onClick={() => editor.duplicateBlock(block.id)} disabled={full}>
        ⧉
      </ToolButton>
      <ToolButton label="Hapus (Del)" onClick={() => editor.removeBlock(block.id)} danger disabled={block.locked}>
        ✕
      </ToolButton>
    </>
  );
}
