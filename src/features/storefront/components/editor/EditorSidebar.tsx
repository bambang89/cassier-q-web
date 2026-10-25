'use client';

import { cn } from '@/utils/cn';
import type { StorefrontEditor } from '@/features/storefront/types';
import { EDITOR_PANELS, MAX_BLOCKS } from '@/features/storefront/constants';
import { EditorPanelContent } from '@/features/storefront/components/editor/EditorPanelContent';

/** Rel ikon + panel kiri (layar lebar). */
export function EditorSidebar({ editor }: { editor: StorefrontEditor }) {
  const { panel, setPanel, doc } = editor;
  return (
    <aside className="hidden shrink-0 border-r border-line bg-white lg:flex">
      <nav className="flex w-[68px] flex-col items-center gap-1 border-r border-line bg-gray-25 py-3">
        {EDITOR_PANELS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPanel(p.key)}
            className={cn(
              'flex w-14 cursor-pointer flex-col items-center gap-1 rounded-xl py-2 text-[10.5px] font-semibold transition duration-200',
              panel === p.key ? 'bg-primary-600 text-white shadow-rail' : 'text-ink-2 hover:bg-white hover:shadow-sm',
            )}
          >
            <span className={cn('text-lg transition', panel === p.key && 'scale-110')}>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </nav>
      <div className="flex w-[300px] flex-col">
        <div className="flex h-12 items-center border-b border-line px-4">
          <p className="font-bold text-ink">{EDITOR_PANELS.find((p) => p.key === panel)?.label}</p>
          {panel === 'layers' ? <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-ink-2">{doc.blocks.length}/{MAX_BLOCKS}</span> : null}
        </div>
        <div key={panel} className="scroll-thin min-h-0 flex-1 animate-fade-in overflow-y-auto p-4">
          <EditorPanelContent editor={editor} panel={panel} />
        </div>
      </div>
    </aside>
  );
}
