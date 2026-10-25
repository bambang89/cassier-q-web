'use client';

import { Modal } from '@/components/ui/Modal';
import type { StorefrontEditor } from '@/features/storefront/types';
import { EDITOR_PANELS } from '@/features/storefront/constants';
import { blockLabel } from '@/features/storefront/utils';
import { EditorInspector } from '@/features/storefront/components/editor/EditorInspector';
import { EditorPanelContent } from '@/features/storefront/components/editor/EditorPanelContent';

/** HP / layar sedang: bilah alat bawah + lembar panel & pengaturan blok. */
export function EditorMobileBar({ editor }: { editor: StorefrontEditor }) {
  const { previewMode, mobileSheet, setMobileSheet, selected, history } = editor;
  return (
    <>
      {!previewMode ? (
        <div className="fixed inset-x-3 bottom-[88px] z-40 flex items-center justify-around rounded-2xl border border-line bg-white/95 p-1.5 shadow-float backdrop-blur tab:bottom-4 lg:hidden">
          {EDITOR_PANELS.map((p) => (
            <button key={p.key} type="button" onClick={() => setMobileSheet(p.key)} className="flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10.5px] font-semibold text-ink-2 active:bg-gray-100">
              <span className="text-lg">{p.icon}</span>
              {p.label}
            </button>
          ))}
          <span className="mx-1 h-8 w-px bg-line" />
          <button type="button" onClick={history.undo} disabled={!history.canUndo} className="flex cursor-pointer flex-col items-center px-2 text-[10.5px] font-semibold text-ink-2 disabled:opacity-30">
            <span className="text-lg">↶</span>Undo
          </button>
        </div>
      ) : null}

      <Modal isOpen={!!mobileSheet && mobileSheet !== 'inspector'} onClose={() => setMobileSheet(null)} title={EDITOR_PANELS.find((p) => p.key === mobileSheet)?.label} size="lg">
        <div className="max-h-[70dvh] overflow-y-auto pb-2">{mobileSheet && mobileSheet !== 'inspector' ? <EditorPanelContent editor={editor} panel={mobileSheet} /> : null}</div>
      </Modal>
      <Modal isOpen={mobileSheet === 'inspector' && !!selected} onClose={() => setMobileSheet(null)} title={selected ? `Atur: ${blockLabel(selected)}` : ''} size="lg">
        <div className="max-h-[70dvh] overflow-y-auto pb-2">
          <EditorInspector editor={editor} />
        </div>
      </Modal>
    </>
  );
}
