'use client';

import { DndContext, DragOverlay } from '@dnd-kit/core';

import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/ui/Display';
import { LoadingBlock } from '@/components/ui/Spinner';
import { CloseIcon, LockIcon } from '@/components/ui/icons/ActionIcons';
import { useStorefrontEditor } from '@/features/storefront/hooks/useStorefrontEditor';
import { PaletteDragPreview } from '@/features/storefront/components/BuilderCanvas';
import { EditorCanvas } from '@/features/storefront/components/editor/EditorCanvas';
import { EditorHeaderActions } from '@/features/storefront/components/editor/EditorHeaderActions';
import { EditorInspector } from '@/features/storefront/components/editor/EditorInspector';
import { EditorMobileBar } from '@/features/storefront/components/editor/EditorMobileBar';
import { EditorSidebar } from '@/features/storefront/components/editor/EditorSidebar';
import { InsertBlockModal } from '@/features/storefront/components/editor/InsertBlockModal';
import { builderCollision } from '@/features/storefront/utils';

/** Editor toko online (drag & drop) untuk pemilik toko. */
export function StorefrontEditor() {
  const editor = useStorefrontEditor();
  const { isManager, loaded, savedPublished, host, doc, dirty, previewMode, selected, dnd } = editor;

  if (!isManager) {
    return (
      <>
        <PageHeader title="Toko Online" />
        <EmptyState icon={LockIcon} title="Khusus pemilik toko" description="Tampilan toko online hanya bisa diatur oleh Kepala Toko." />
      </>
    );
  }
  if (!loaded) {
    return (
      <>
        <PageHeader title="Toko Online" />
        <LoadingBlock label="Memuat editor…" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Desain Toko Online"
        subtitle={`${savedPublished ? `Tayang · ${host}/toko/${doc.slug}` : 'Draf · belum diterbitkan'}${dirty ? ' · ada perubahan belum disimpan' : ''}`}
        right={<EditorHeaderActions editor={editor} />}
      />

      <DndContext sensors={dnd.sensors} collisionDetection={builderCollision} onDragStart={dnd.onDragStart} onDragMove={dnd.onDragMove} onDragEnd={dnd.onDragEnd} onDragCancel={dnd.onDragCancel}>
        <div className="relative flex min-h-0 flex-1">
          {!previewMode ? <EditorSidebar editor={editor} /> : null}
          <EditorCanvas editor={editor} />
          {/* Kanan: pengaturan blok (laci geser, layar lebar) */}
          {selected && !previewMode ? (
            <aside key={selected.id} className="absolute inset-y-0 right-0 z-40 hidden w-[340px] animate-slide-in flex-col border-l border-line bg-white shadow-[-20px_0_40px_-20px_rgb(11_31_51/0.25)] lg:flex xl:static xl:shadow-none">
              <div className="flex h-12 items-center justify-between border-b border-line px-4">
                <p className="font-bold text-ink">Atur Blok</p>
                <button type="button" onClick={() => editor.setSelectedId(null)} aria-label="Tutup" className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-ink-3 hover:bg-gray-100">
                  <CloseIcon size={16} />
                </button>
              </div>
              <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-4">
                <EditorInspector editor={editor} />
              </div>
            </aside>
          ) : null}
        </div>

        <EditorMobileBar editor={editor} />

        <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}>{dnd.dragType ? <PaletteDragPreview type={dnd.dragType} /> : null}</DragOverlay>
      </DndContext>

      <InsertBlockModal editor={editor} />
    </>
  );
}
